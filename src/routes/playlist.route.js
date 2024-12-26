import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deleteVideoFromPlaylist, getUserPlaylists } from "../controllers/playlist.model.js";

const router = new Router()

router.route("/create-playlist").post(verifyJWT, createPlaylist)

router.route("/get-user-playlists/:userId").get(verifyJWT, getUserPlaylists)

router.route("/add-video/:videoId/playlist/:playlistId").patch(verifyJWT, addVideoToPlaylist)

router.route("/delete-video/:videoId/playlist/:playlistId").patch(verifyJWT, deleteVideoFromPlaylist)

export default router;