import {Router} from "express"
import {upload} from "../middlewares/multer.middleware.js"
import {
    publishVideo,
    getVideoById,
    updateVideo
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { get } from "mongoose";

const router = Router();

router.route("/upload").post(verifyJWT, upload.fields([
    {
        name: "thumbnail",
        maxCount: 1
    },
    {
        name: "video",
        maxCount: 1
    }
]), publishVideo)

router.route("/find/:videoId").get(verifyJWT, getVideoById)

router.route("/update/:videoId").post(verifyJWT, upload.single("newThumbnail"), updateVideo)

export default router;