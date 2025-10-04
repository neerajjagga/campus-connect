import express from "express";
import { checkAuth } from "./../middlewares/user.middleware.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const messageRouter = express.Router();

messageRouter.get("/:userId", checkAuth, getMessages);
messageRouter.post("/send/:userId", checkAuth, sendMessage);

export default messageRouter;
