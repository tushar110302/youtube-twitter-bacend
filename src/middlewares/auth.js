import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) =>{
    try {
        const token = req.cookies.accessToken;
        if(!token){
            throw new ApiError(401, "Unauthorised Token");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user; // Adding new field to req named user
        next();
        
    } catch (error) {
        next(error)
    }
}