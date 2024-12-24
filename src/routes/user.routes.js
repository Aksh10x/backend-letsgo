import {Router} from "express";
import { 
    registerUser,
    loginUser , 
    logoutUser,
    refreshAccessToken,
    getCurrentUser, 
    changeCurrentPassword,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)    

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refreshToken").post(refreshAccessToken)

router.route("/changePassword").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/updateAvatar").patch(verifyJWT, 
    upload.single("avatar"),
    updateUserAvatar)

router.route("/updateCoverImage").patch(verifyJWT, 
    upload.single("coverImage"),
    updateUserCoverImage)

router.route("/getChannel/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)

export default router;   // can import like: import router from (no {})