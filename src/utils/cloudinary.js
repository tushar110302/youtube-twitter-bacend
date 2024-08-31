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
        // console.log(response);
        fs.unlinkSync(localPath);
        return response;
    } catch (error) {
        fs.unlinkSync(localPath); // Remove the locally saved temmporary file as upload failed
        console.log("Cloudinary File Error: ", error)
        return null;
    }
}

const deleteFromCloudinary = async(filePath) => {
    try {
        console.log("File path to delete", filePath)
        const publicId = filePath.split("/")[7].split(".")[0]

        if(!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId, ()=>{
            console.log("Deleted successfully")
        })

        return response;
    } catch (error) {
        throw new ApiError(500, "Something went wrong while deleting file")
    }

}


export {uploadOnCloudinary, deleteFromCloudinary};