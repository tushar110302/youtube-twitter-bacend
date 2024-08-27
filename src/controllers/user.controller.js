import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const registerUser = async(req, res, next) => {
   try {
    const {email, username, fullName, password} = req.body;

    if(email.trim() === "" || username.trim() === "" || fullName.trim() === "" || password.trim() === ""){
        throw new ApiError(400, "Please Enter all the required fields");
    }
    console.log(req.body);

    const exists = await User.findOne({ $or: [{username: username}, {email: email} ]});
    if(exists){
        throw new ApiError(400, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.at(0).path;
    const coverImageLocalPath = req.files?.coverImage?.at(0).path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const cover = await uploadOnCloudinary(coverImageLocalPath);
    // if(coverImageLocalPath){
    //     const cover = await uploadOnCloudinary(coverImageLocalPath);
    // }

    if(!avatar){
        throw new ApiError(400, "Avatar image upload problem");
    }

    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        coverImage: cover?.url || "",
        username: username.toLowerCase(),
        password
    });
    const createdUser = await User.findById(user._id).select("-password");
    if(!createdUser){
        throw ApiError(500, "User registeration problem")
    }
    console.log(createdUser)
    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
   } 
   catch (error) {
    console.log(error);
   }
}
export {registerUser};