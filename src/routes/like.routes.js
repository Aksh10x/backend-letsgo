import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {toggleVideoLike, toggleTweetLike, toggleCommentLike, getVideoLikes} from "../controllers/like.controller.js";

const router = new Router();

router.route("/video-like/:videoId").post(verifyJWT, toggleVideoLike)

router.route("/tweet-like/:tweetId").post(verifyJWT, toggleTweetLike)

router.route("/comment-like/:commentId").post(verifyJWT, toggleCommentLike)

router.route("/get-video-likes/:videoId").get(verifyJWT, getVideoLikes)

export default router;