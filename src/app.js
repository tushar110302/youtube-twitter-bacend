import dotenv from "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.route.js";
import healthcheckRouter from "./routes/healthcheck.route.js"
import tweetRouter from "./routes/tweet.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import videoRouter from "./routes/video.route.js"
import commentRouter from "./routes/comment.route.js"
import likeRouter from "./routes/like.route.js"
import playlistRouter from "./routes/playlist.route.js"


//routes declaration
app.use("/api/healthcheck", healthcheckRouter)
app.use("/api/users", userRouter)
app.use("/api/tweets", tweetRouter)
app.use("/api/subscriptions", subscriptionRouter)
app.use("/api/videos", videoRouter)
app.use("/api/comments", commentRouter)
app.use("/api/likes", likeRouter)
app.use("/api/playlist", playlistRouter)



app.use((err, req, res, next) => {
    res.status(err.statusCode).json(err);
});

export { app };