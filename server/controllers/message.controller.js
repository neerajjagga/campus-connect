import cloudinary from "../lib/cloudinary.js";
import { getUserSocket } from "../lib/websocket.js";
import Message from "../models/message.model.js";

export const getMessages = async (req, res) => {
  const anotherUserId = req.params.userId;
  const currentUserId = req.user._id;

  if (!anotherUserId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required!",
    });
  }

  try {
    const messages = await Message.find({
      $or: [
        { senderId: anotherUserId, receiverId: currentUserId },
        { senderId: currentUserId, receiverId: anotherUserId },
      ],
    });
    return res
      .status(200)
      .json({ success: true, message: "Messages Fetched Success!", messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { text, image } = req.body;
  const senderId = req.user._id;
  const receiverId = req.params.userId;

  console.log(text, image);

  if (!text && !image) {
    return res.status(400).json({
      success: false,
      message: "Field text or image is required to send message!",
    });
  }

  if (!receiverId) {
    return res.status(400).json({
      success: false,
      message: "Receiver ID is required to send message!",
    });
  }

  try {
    let imageUrl = null;

    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        format: "webp",
      });
      imageUrl = uploadRes.secure_url;
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      imageUrl,
    });

    // Send message to another users in real time using websocket
    const receiverUserSocket = getUserSocket(receiverId);

    console.log(receiverUserSocket);

    if (receiverUserSocket) {
      receiverUserSocket.send(
        JSON.stringify({
          success: true,
          type: "message",
          message,
        })
      );
    }

    return res
      .status(201)
      .json({ success: true, message: "Messsage Send Success!", message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
