import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    addComment, 
    editComment,
    deleteComment,
    getVideoComments
 } from "../controllers/comment.controller.js";


const router = new Router();

router.route("/upload/:videoId").post(verifyJWT, addComment)

router.route("/edit/:commentId").patch(verifyJWT, editComment)

router.route("/delete/:commentId").delete(verifyJWT, deleteComment)

router.route("/get-video-comments/:videoId").get(verifyJWT, getVideoComments)

export default router;