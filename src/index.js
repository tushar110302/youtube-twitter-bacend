import dotenv from "dotenv";
import  connectDB  from "./db/index.js";
import { app } from "./app.js";
dotenv.config();

const port = process.env.PORT || 3000;

connectDB()
.then(()=> {
    app.on("error", (error) => {
        console.error(error);
        process.exit(1);
    })
    app.listen(port, () => {
        console.log(`App is listening on port ${port} http://localhost:${port}`);
    })
})
.catch((error) => {
    console.error(`MongoDB connection error: ${error}`);
})














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

