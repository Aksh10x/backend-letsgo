import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

//configs
app.use(cors({
    origin: process.env.CORS_ORIGIN, //who can acces backend

}));

app.use(express.json({
    limit: "20kb"  //json shouldnt crash backend
}));

app.use(express.urlencoded({
    extrended:true,
    limit:"20kb",
}));

app.use(express.static('public')); //to store public assets in the server(backend)

app.use(cookieParser()); //perform crud operations on cookies of client

//routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.route.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.route.js"

//router import
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlists", playlistRouter)


export {app};