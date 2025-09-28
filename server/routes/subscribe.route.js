import express from 'express';
const subscribeRouter = express.Router();

import { subscribeEmail } from '../controllers/subscribe.controller.js';
import { unsubscribeEmail } from '../controllers/subscribe.controller.js';
import { checkAuth } from '../middlewares/user.middleware.js';

subscribeRouter.post('/', checkAuth, subscribeEmail);
subscribeRouter.delete('/', checkAuth, unsubscribeEmail);

export default subscribeRouter 