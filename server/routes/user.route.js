import express from "express";
import {
  signUpUser,
  loginUser,
  logoutUser,
  refreshTokens,
  getUserProfile,
  updateProfile,
  getUsers,
  subscribeEmail,
  unsubscribeEmail
} from "../controllers/user.controller.js";
import {
  checkAuth,
  validateAdminSignUpData,
} from "../middlewares/user.middleware.js";

const userRouter = express.Router();

userRouter.post("/signup", validateAdminSignUpData, signUpUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.post("/refresh-token", refreshTokens);
userRouter.get("/profile", checkAuth, getUserProfile);
userRouter.post("/update-profile", checkAuth, updateProfile);
userRouter.get("/users/:role", checkAuth, getUsers);
userRouter.get("/check", checkAuth, (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Check Auth Controller Error " + error.message);
    return res.status(500).json({ message: error.message });
  }
});

userRouter.post('/subscribe', checkAuth, subscribeEmail);
userRouter.delete('/unsubscribe', checkAuth, unsubscribeEmail);

export default userRouter;
