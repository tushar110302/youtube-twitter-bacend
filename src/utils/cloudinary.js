import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async function (localPath) {
    try {
        if (!localPath) {
            return null;
        }
        // Upload file
        const response = await cloudinary.uploader.upload(localPath, {
            resource_type: "auto"
        });
        console.log("File is uploaded on Cloudinary");
        console.log(response);
        return response;
    } catch (error) {
        fs.unlinkSync(localPath); // Remove the locally saved temmporary file as upload failed
        
        return null;
    }
}

export {uploadOnCloudinary};