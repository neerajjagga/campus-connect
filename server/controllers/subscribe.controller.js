import Subscribe from "../models/subscribe.model.js";
import User from "../models/user.model.js";
import { sendSubscribedEmail } from "../utils/event.utils.js";

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

    const isEmailAlreadySubscribed = await Subscribe.findOne({ email });

    if (isEmailAlreadySubscribed) {
      return res.status(400).json({
        success: false,
        message: "You are already subscribed!",
      });
    }

    await Subscribe.create({ email });
    const user = await User.findByIdAndUpdate(
      { _id: loggedInUser._id },
      { isSubscribed: true },
      { new: true }
    );

    await sendSubscribedEmail(email);

    return res.json({
      success: true,
      user,
      message: "Email Subscribed Successfully!",
    });
  } catch (error) {
    console.log("Error coming while subscribing email", error.message);
    return res.status(500).json({
      success: false,
      message: "Unknown error occurred while subscribing email",
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

    const isEmailAlreadyUnsubscribed = await Subscribe.findOne({ email });

    if (!isEmailAlreadyUnsubscribed) {
      return res.status(400).json({
        success: false,
        message: "You are already Unsubscribed!",
      });
    }

    await Subscribe.findOneAndDelete({ email });
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
      message: "Unknown error occurred while Unsubscribing email",
    });
  }
};
