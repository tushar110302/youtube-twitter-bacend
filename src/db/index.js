import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
        console.log(`\nConnection Instance : ${connectionInstance}\n`)
        console.log(`\nMongoDB connection host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error(`Mongo DB connection FAILED: ${error}`);
        process.exit(1);
    }
}

export default connectDB;