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

app.use("/api/users", userRouter);

app.use((err, req, res, next) => {
    res.status(err.statusCode).json(err);
});

export { app };