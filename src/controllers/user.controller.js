import asyncHandler from "../utils/asyncHandler.js";

const registerUser = async(req, res) => {
    try {
        // res.status(200).json({message : "ok"})
        throw "Error"
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({
            message: error,
            statusCode:500
        })
    }
}
export {registerUser};