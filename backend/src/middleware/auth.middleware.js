import jwt from "jsonwebtoken";
import User from "../modules/user.model.js";

export const protectRoute=async(req,res,next)=>{

try {
    const token=req.cookies.jwt;

    if(!token){
        return res.status(401).json({message:"Unauhorized-No Token Provided"});
    }
   // console.log("Token:", token);
    const decoded =jwt.verify(token,process.env.JWT_SECRET);
    //console.log("Decoded Token:", decoded);
    if(!decoded){
        return res.status(401).json({message:"Unauhorized- invalide Provided"});
    }
    const user=await User.findById(decoded.userId).select("-password");
    //console.log("user ",user);
    if(!user){
        return res.status(404).json({message:"User Not Found"});
    }
    req.user=user
    next()
} catch (error) {
    console.log("error in Middleware controller",error.message);
    res.status(500).json({message:"internal server error"})
}
}