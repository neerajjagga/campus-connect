import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Redis } from "../lib/redis.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import {
  generateTokens,
  setCookies,
  storeRefreshToken,
} from "../utils/user.utils.js";
import cloudinary from "../lib/cloudinary.js";
import { sendSubscribedEmail } from "../utils/event.utils.js";
dotenv.config();

export const signUpUser = async (req, res) => {
  try {
    const data = req.body;

    const isUserAlreadyPresent = await User.findOne({ email: data.email });

    if (isUserAlreadyPresent) {
      return res.status(409).json({
        success: false,
        message: "Account already present with these credentials",
      });
    }

    if (data.role === "admin") {
      if (!data.secret || data.secret !== process.env.ADMIN_SECRET_KEY) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid admin secret key!" });
      }
    }

    // upload image on cloudinary
    if (data.profileImage) {
      try {
        const uploadRes = await cloudinary.uploader.upload(data.profileImage, {
          transformation: [
            { width: 300, height: 300, crop: "fill", gravity: "face" },
          ],
          format: "webp",
          folder: "profile_images",
        });
        data["profileImageUrl"] = uploadRes.secure_url;
      } catch (error) {
        console.log(error);
        console.log("Error coming while uploading course image", error.message);
        throw error;
      }
    }

    const user = await User.create(data);

    // generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // store refresh token in redis
    await storeRefreshToken(refreshToken, user._id);

    // set both tokens in secure cookies
    setCookies(accessToken, refreshToken, res);

    return res.status(201).json({
      user: { ...user._doc, password: undefined },
      message: "User created successfully",
    });
  } catch (error) {
    console.log("Error coming while signup" + error.message);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find the user first
    const user = await User.findOne({ email })
      .populate({ path: "events" })
      .populate({ path: "attendedEvents" })
      .populate({ path: "followingClubs", populate: { path: "events" } })
      .populate({
        path: "adminAtClubs",
        populate: {
          path: "events",
        },
      })
      .lean();

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    // match the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    // generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    await storeRefreshToken(refreshToken, user._id);

    setCookies(accessToken, refreshToken, res);

    res.status(200).json({
      user: { ...user, password: undefined },
      message: "User loggedIn successfully",
    });
  } catch (error) {
    console.log("Error coming while login user" + error.message);
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { access_token: accessToken, refresh_token: refreshToken } =
      req.cookies;

    if (!accessToken && !refreshToken) {
      return res.status(400).json({
        message: "You are already logged out",
      });
    }

    if (refreshToken) {
      try {
        const decodedObj = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        await Redis.del(`refresh_token:${decodedObj.userId}`);
      } catch (error) {
        console.log("Invalid or expired refresh token.");
      }
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error coming while logout user" + error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const refreshTokens = async (req, res) => {
  try {
    const { refresh_token } = req.cookies;

    if (!refresh_token) {
      return res.status(401).json({
        message: "Refresh token missing. Please log in again.",
      });
    }

    let userId = null;
    try {
      const decodedObj = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET
      );
      userId = decodedObj.userId;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Refresh token expired. Please log in again." });
      }
      throw error;
    }

    const storedRefreshToken = await Redis.get(`refresh_token:${userId}`);

    if (!storedRefreshToken || refresh_token !== storedRefreshToken) {
      return res.status(403).json({
        message: "Invalid refresh token. Please login again",
      });
    }

    // generate both access token and refresh token to rotate refresh token
    const { accessToken, refreshToken } = generateTokens(userId);
    await storeRefreshToken(refreshToken, userId);
    setCookies(accessToken, refreshToken, res);

    res.json({ message: "Tokens refreshed successfully" });
  } catch (error) {
    console.log("Error coming while refreshing tokens" + error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role === "student") {
      const profileData = await User.findOne({ _id: id })
        .select("-password")
        .populate({ path: "attendedEvents" })
        .populate({ path: "followingClubs", populate: { path: "events" } })
        .lean();
      return res.status(200).json(profileData);
    } else {
      const profileData = await User.findOne({ _id: id })
        .select("-password")
        .populate({ path: "events" })
        .populate({ path: "followingClubs", populate: { path: "events" } })
        .populate({
          path: "adminAtClubs",
          populate: {
            path: "events",
          },
        })
        .lean();
      return res.status(200).json(profileData);
    }
  } catch (error) {
    console.log("Error while getting profile" + error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const data = req.body;
  const loggedInUser = req.user;
  const oldProfileImageUrl = loggedInUser.profileImageUrl;

  try {
    if (data?.profileImage) {
      if (oldProfileImageUrl) {
        try {
          // Extract public ID from the URL
          const urlParts = oldProfileImageUrl.split("/");
          const publicIdWithExtension = urlParts.slice(7).join("/");
          const publicId = publicIdWithExtension.split(".")[0];

          // Delete image from Cloudinary
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }
      // upload image on cloudinary
      try {
        const uploadRes = await cloudinary.uploader.upload(data.profileImage, {
          transformation: [
            { width: 300, height: 300, crop: "fill", gravity: "face" },
          ],
          format: "webp",
          folder: "profile_images",
        });
        data["profileImageUrl"] = uploadRes.secure_url;
        delete data.profileImage;
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    if (oldProfileImageUrl && data.profileImageUrl === "") {
      try {
        // Extract public ID from the URL
        const urlParts = oldProfileImageUrl.split("/");
        const publicIdWithExtension = urlParts.slice(7).join("/");
        const publicId = publicIdWithExtension.split(".")[0];

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    const updatedProfile = await User.findByIdAndUpdate(
      { _id: loggedInUser._id },
      data,
      { new: true }
    )
      .populate({ path: "events" })
      .populate({ path: "attendedEvents" })
      .populate({ path: "followingClubs", populate: { path: "events" } })
      .populate({
        path: "adminAtClubs",
        populate: {
          path: "events",
        },
      });

    return res.status(201).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.log("Error coming while update profile" + error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  const { role } = req.params;
  const { id } = req.user;

  try {
    const users = await User.find({
      role: role,
      _id: { $ne: id },
    });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.log("Error coming while fetching admins" + error.message);
    res.status(500).json({ message: error.message });
  }
};

export const subscribeEmail = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const email = req.user.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required!",
      });
    }

    if (loggedInUser.isSubscribed) {
      return res.status(400).json({
        success: false,
        message: "You are already subscribed!",
      });
    }

    const user = await User.findByIdAndUpdate(
      { _id: loggedInUser._id },
      { isSubscribed: true },
      { new: true }
    );

    sendSubscribedEmail(email);

    return res.json({
      success: true,
      user,
      message: "Email Subscribed Successfully!",
    });
  } catch (error) {
    console.log("Error coming while subscribing email", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const unsubscribeEmail = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const email = req.user.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required!",
      });
    }

    if (!loggedInUser.isSubscribed) {
      return res.status(400).json({
        success: false,
        message: "You are already Unsubscribed!",
      });
    }

    const user = await User.findByIdAndUpdate(
      { _id: loggedInUser._id },
      { isSubscribed: false },
      { new: true }
    );

    return res.json({
      success: true,
      user,
      message: "Email Unsubscribed Successfully!",
    });
  } catch (error) {
    console.log("Error coming while Unsubscribing email", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
