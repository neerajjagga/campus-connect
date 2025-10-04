import Event from "../models/event.model.js";
import Club from "../models/club.model.js";
import User from "../models/user.model.js";
import { sendEventEmail } from "../utils/event.utils.js";
import cloudinary from "../lib/cloudinary.js";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

export const createEvent = async (req, res) => {
  try {
    const admin = req.user;
    const data = req.body;

    if (!data.title || !data.date || !data.location || !data.category) {
      return res.status(400).json({
        success: false,
        message: "title, date, category and location are required",
      });
    }

    // upload image on cloudinary
    if (data.eventImage) {
      try {
        const uploadRes = await cloudinary.uploader.upload(data.eventImage, {
          format: "webp",
          folder: "event_images",
        });
        data["eventImageUrl"] = uploadRes.secure_url;
      } catch (error) {
        console.log(error);
        console.log("Error coming while uploading image", error.message);
        throw error;
      }
    }

    let club;
    if (data.club) {
      club = await Club.findOne({
        _id: data.club,
        "admins.admin": { $in: [admin._id] },
      });

      if (!club) {
        return res.status(404).json({
          success: false,
          message: "Club not found",
        });
      }
    } else {
      delete data.club;
    }

    const titleSlug = slugify(data.title, { lower: true, strict: true });
    data["titleSlug"] = `${titleSlug}-${uuidv4().slice(0, 8)}`;
    data["author"] = admin._id;

    const event = await Event.create(data);

    if (club) {
      club.events.push(event._id);
      await club.save();
    }

    
    admin.events.push(event._id);
    await admin.save();
    
    // run an async task to notify all the subscribe users about the event
    sendEventEmail(event);

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
    });
  } catch (error) {
    console.log("Error coming while creating event", error.message);
    return res.status(500).json({
      success: false,
      message: "Unknown error occurred while creating event",
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const admin = req.user;

    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event Id is required",
      });
    }

    const event = await Event.findOne({ _id: eventId, author: admin._id });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // pull object events from admin
    await User.findByIdAndUpdate(admin._id, {
      $pull: { events: event._id },
    });

    // Find the club that contains the event and remove it
    await Club.updateMany(
      { events: event._id },
      { $pull: { events: event._id } }
    );

    if (event.eventImageUrl) {
      try {
        // Extract public ID from the URL
        const urlParts = event.eventImageUrl.split("/");
        const publicIdWithExtension = urlParts.slice(7).join("/");
        const publicId = publicIdWithExtension.split(".")[0];

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    await Event.findByIdAndDelete(event._id);

    return res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.log("Error coming while deleting event", error.message);
    return res.status(500).json({
      success: false,
      message: "Unknown error occurred while deleting event",
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const admin = req.user;
    const { eventId } = req.params;
    const data = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "EventId is required",
      });
    }

    const event = await Event.findOne({ _id: eventId, author: admin._id });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // upload new image if it is present in data
    if (data.eventImage) {
      try {
        const uploadRes = await cloudinary.uploader.upload(data.eventImage, {
          format: "webp",
          folder: "event_images",
        });
        data["eventImageUrl"] = uploadRes.secure_url;
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    // delete old image of event if it present in data (if no new image is provided then not delete old image)
    if (data.oldEventImage && data.eventImage) {
      try {
        // Extract public ID from the URL
        const urlParts = data.oldEventImage.split("/");
        const publicIdWithExtension = urlParts.slice(7).join("/");
        const publicId = publicIdWithExtension.split(".")[0];

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    if (data.club) {
      await Club.updateMany({}, { $pull: { events: eventId } });
      await Club.findByIdAndUpdate(
        { _id: data.club },
        { $addToSet: { events: eventId } }
      );
    } else {
      if (event.club !== null) {
        await Club.findByIdAndUpdate(
          { _id: event.club },
          { $pull: { events: eventId } }
        );
      }
      data.club = null;
    }

    const titleSlug = slugify(data.title, { lower: true, strict: true });
    data["titleSlug"] = `${titleSlug}-${uuidv4().slice(0, 8)}`;

    delete data.eventImage;
    delete data.oldEventImage;

    const updatedEvent = await Event.findByIdAndUpdate(eventId, data, {
      new: true,
    });
    console.log(updatedEvent);

    return res.json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.log("Error coming while updating event", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    const AUTHOR_SAFE_DATA = "name profileImageUrl";
    // let { page, limit } = req.query;

    // page = page || 1;
    // limit = limit || 10;
    // let skip = (page - 1) * limit;

    const events = await Event.find({})
      .populate("author", AUTHOR_SAFE_DATA)
      .sort({ createdAt: -1 })
      .lean();
    // .skip(skip)
    // .limit(limit)

    return res.json({
      success: true,
      message: "Events fetched successfully",
      events,
    });
  } catch (error) {
    console.log("Error coming while getting events", error.message);
    return res.status(500).json({
      success: false,
      message: "Unknown error occurred while getting events",
    });
  }
};

export const getSingleEvent = async (req, res) => {
  const { eventId } = req.params;

  const AUTHOR_SAFE_DATA = "name profileImageUrl";
  const CLUB_SAFE_DATA = "name clubImageUrl";

  try {
    const event = await Event.findById({ _id: eventId })
      .populate("author", AUTHOR_SAFE_DATA)
      .populate("club", CLUB_SAFE_DATA);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.log("Error coming while fetching event", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserEvents = async (req, res) => {
  const { userId } = req.params;
  const AUTHOR_SAFE_DATA = "name profileImageUrl";
  try {
    const events = await Event.find({ author: userId })
      .populate("author", AUTHOR_SAFE_DATA)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      message: "Events fetched successfully",
      events,
    });
  } catch (error) {
    console.log("Error coming while fetching user events", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
