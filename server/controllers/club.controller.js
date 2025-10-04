import Club from "../models/club.model.js";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import cloudinary from "../lib/cloudinary.js";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

export const createClub = async (req, res) => {
  try {
    const admin = req.user;
    const data = req.body;

    if (!data.name || !data.description) {
      return res.status(400).json({
        success: false,
        message: "Name and description is required",
      });
    }

    if (data.clubImage) {
      try {
        const uploadRes = await cloudinary.uploader.upload(data.clubImage, {
          format: "webp",
          folder: "club_images",
        });
        data["clubImageUrl"] = uploadRes.secure_url;
      } catch (error) {
        console.log(
          "Error coming while uploading club profile image",
          error.message
        );
      }
    }

    const nameSlug = slugify(data.name, { lower: true, strict: true });

    data["nameSlug"] = `${nameSlug}-${uuidv4().slice(0, 8)}`;

    data["createdBy"] = admin._id;

    data["admins"] = [
      ...data["admins"],
      {
        admin: admin._id,
      },
    ];

    // create club
    const club = await Club.create(data);

    // Update all admin users' adminAtClubs field asynchronously
    data.admins.forEach((obj) => {
      User.findByIdAndUpdate(obj.admin, {
        $addToSet: { adminAtClubs: club._id },
      }).exec();
    });

    return res.status(201).json({
      success: true,
      message: "Club created successfully",
    });
  } catch (error) {
    console.log("Error coming while creating club", error.message);
    return res.status(500).json({
      success: false,
      message: "Unknown error occurred while creating club",
    });
  }
};

export const deleteClub = async (req, res) => {
  const { clubId } = req.params;
  const admin = req.user;
  try {
    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: "Club Id is required",
      });
    }

    const club = await Club.findOne({ _id: clubId, createdBy: admin._id });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    // Remove the club ID from the `adminAtClubs` field in User model
    await User.updateMany(
      { adminAtClubs: clubId },
      { $pull: { adminAtClubs: clubId } }
    );

    await Event.updateMany({ club: clubId }, { club: null });

    if (club.clubImageUrl) {
      try {
        // Extract public ID from the URL
        const urlParts = club.clubImageUrl.split("/");
        const publicIdWithExtension = urlParts.slice(7).join("/");
        const publicId = publicIdWithExtension.split(".")[0];

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    await Club.findByIdAndDelete(club._id);

    return res.json({
      success: true,
      message: "Club deleted successfully",
    });
  } catch (error) {
    console.log("Error coming while deleting club", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const admin = req.user;
    const data = req.body;

    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: "ClubId is required",
      });
    }

    const club = await Club.findOne({ _id: clubId, createdBy: admin._id });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    // upload new image if it is present in data
    if (data.clubImage) {
      try {
        const uploadRes = await cloudinary.uploader.upload(data.clubImage, {
          format: "webp",
          folder: "club_images",
        });
        data["clubImageUrl"] = uploadRes.secure_url;
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    // delete old image of event if it present in data (if no new image is provided then not delete old image)
    if (data.oldClubImage && data.clubImage) {
      try {
        // Extract public ID from the URL
        const urlParts = data.oldClubImage.split("/");
        const publicIdWithExtension = urlParts.slice(7).join("/");
        const publicId = publicIdWithExtension.split(".")[0];

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    // remove clubId from adminAtClubs field of oldClub admin users
    club.admins.forEach((obj) => {
      User.findByIdAndUpdate(obj.admin, {
        $pull: { adminAtClubs: club._id },
      }).exec();
    });

    // add clubId in adminAtClubs field from admin users of data
    data.admins.forEach((obj) => {
      User.findByIdAndUpdate(obj.admin, {
        $addToSet: { adminAtClubs: club._id },
      }).exec();
    });

    const nameSlug = slugify(data.name, { lower: true, strict: true });
    data["nameSlug"] = `${nameSlug}-${uuidv4().slice(0, 8)}`;

    delete data.clubImage;
    delete data.oldClubImage;

    const updatedClub = await Club.findByIdAndUpdate(clubId, data, {
      new: true,
    });

    return res.json({
      success: true,
      message: "Club updated successfully",
      event: updatedClub,
    });
  } catch (error) {
    console.log("Error coming while updating club", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getClubs = async (req, res) => {
  try {
    const ADMINS_SAFE_DATA = "name profileImageUrl";
    const FOLLOWERS_SAFE_DATA = "name profileImageUrl";
    const EVENTS_SAFE_DATA = "title eventImageUrl";

    const clubs = await Club.find({})
      .populate("followers", FOLLOWERS_SAFE_DATA)
      .populate("events", EVENTS_SAFE_DATA)
      .populate("admins.admin", ADMINS_SAFE_DATA)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      message: "Clubs fetched successfully",
      clubs,
    });
  } catch (error) {
    console.log("Error coming while getting clubs", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleClub = async (req, res) => {
  const { clubId } = req.params;

  const ADMINS_SAFE_DATA = "name profileImageUrl";
  const FOLLOWERS_SAFE_DATA = "name profileImageUrl";
  const EVENTS_SAFE_DATA = "title eventImageUrl date";
  try {
    const club = await Club.findById({ _id: clubId })
      .populate("followers", FOLLOWERS_SAFE_DATA)
      .populate("events", EVENTS_SAFE_DATA)
      .populate("admins.admin", ADMINS_SAFE_DATA);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    return res.json({
      success: true,
      club,
    });
  } catch (error) {
    console.log("Error coming while fetching club", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const followClub = async (req, res) => {
  const clubToFollowClubId = req.params.clubId;
  const loggedInUserId = req.user._id;

  try {
    // find the club
    const clubToFollow = await Club.findOne({ _id: clubToFollowClubId });
    if (!clubToFollow) {
      return res.status(400).json({
        success: false,
        message: "Invalid Club Id!",
      });
    }
    if (clubToFollow.followers.includes(loggedInUserId)) {
      return res.status(400).json({
        success: false,
        message: `You are already following ${clubToFollow.name} club.`,
      });
    }

    await User.findByIdAndUpdate(
      { _id: loggedInUserId },
      {
        $addToSet: { followingClubs: clubToFollowClubId },
      }
    );

    await Club.findOneAndUpdate(
      { _id: clubToFollowClubId },
      {
        $addToSet: { followers: loggedInUserId },
      }
    );

    return res.status(201).json({
      success: true,
      message: `${clubToFollow.name} Club Followed!`,
    });
  } catch (error) {
    console.log("Error coming while follow club", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const unfollowClub = async (req, res) => {
  const clubToUnfollowClubId = req.params.clubId;
  const loggedInUserId = req.user._id;

  try {
    // check is the club valid or not
    const clubToUnfollow = await Club.findOne({ _id: clubToUnfollowClubId });
    if (!clubToUnfollow) {
      return res.status(400).json({
        success: false,
        message: "Invalid Club Id!",
      });
    }

    // if isFollowing then remove and update the loggedInUser
    await User.findByIdAndUpdate(
      { _id: loggedInUserId },
      {
        $pull: { followingClubs: clubToUnfollowClubId },
      }
    );

    // also update the club
    await Club.findOneAndUpdate(
      { _id: clubToUnfollowClubId },
      {
        $pull: { followers: loggedInUserId },
      }
    );

    return res.status(201).json({
      success: true,
      message: `${clubToUnfollow.name} Club Unfollowed!`,
    });
  } catch (error) {
    console.log("Error coming while unfollow club", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserClubs = async (req, res) => {
  const { userId } = req.params;
  const ADMINS_SAFE_DATA = "name profileImageUrl";
  const FOLLOWERS_SAFE_DATA = "name profileImageUrl";
  const EVENTS_SAFE_DATA = "title eventImageUrl";
  try {
    const clubs = await Club.find({ createdBy: userId })
      .populate("followers", FOLLOWERS_SAFE_DATA)
      .populate("events", EVENTS_SAFE_DATA)
      .populate("admins.admin", ADMINS_SAFE_DATA)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      message: "Clubs fetched successfully",
      clubs,
    });
  } catch (error) {
    console.log("Error coming while fetching user clubs", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
