import mongoose from "mongoose";
// require("dotenv").config()
import dotenv from "dotenv"
import connectDB from "./db/index.js";
dotenv.config()


console.log(process.env.PORT)
connectDB()














// import express from "express";

// const app = express();

// ( async () => {
//     try {
//         await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`);

//         app.on("error", (error) => {
//             console.error("Error ", error);
//             throw error;
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on ${port}`)
//         })
//     } catch (error) {
//         console.error("Error" , error);
//         throw error;
//     }
// } )()

