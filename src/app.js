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

export {app};