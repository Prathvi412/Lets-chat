import bcrypt from "bcryptjs";
import User from "../modules/user.model.js";
import { genrateToken } from "../lib/utils.js";
import { response } from "express";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    console.log("Received data:", req.body); // Log the incoming data
    try {
        if (!fullName || !email || !password) {
            console.log("Validation failed: Missing required fields");
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            console.log("Validation failed: Password too short");
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });
        if (user) {
            console.log("Validation failed: Email already exists");
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashPassword,
        });

        console.log("Creating new user:", newUser);

        if (newUser) {
            // Generate JWT token
            genrateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            console.log("Error: Invalid user data");
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Error in signup controller:", error.stack || error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login=async(req,res)=>{
    const {email,password}=req.body;
    console.log( "login details:",req.body);
    try{
        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"invalide cridianal"});
        } 
        const isPasswordCorrect=await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message:"invalide cridianal"});
        }
        genrateToken(user._id,res)
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
        })

    }catch(error){
        console.log("error in login controller",error.message);
        res.status(500).json({message:"internal server error"})

    }
};
export const logout=(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"})
    } catch (error) {
        console.log("error in logout controller",error.message);
        res.status(500).json({message:"internal server error"})
        
    }
};

export const updateProfile=async (req,res) =>{

    try {
        const {profilePic}=req.body;
        const userId=req.user._id;
        
        if(!profilePic){
            return res.status(400).json({message:"Profile pic is required"})
        }
        const uploadResponce=await cloudinary.uploader.upload(profilePic)
        const updateUser=await User.findByIdAndUpdate(userId,{profilePic:uploadResponce.secure_url},{new:true})
        res.status(200).json(updateUser)
    } catch (error) {
        console.error("Error in updateProfile controller:", error); // Logs the full error object

        res.status(500).json({message:"internal server error"})
    }

};

export const checkAuth = (req, res) => {
    try {
        // If middleware is working, `req.user` should be defined
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized - User Not Authenticated" });
        }
        res.status(200).json(req.user); // Send the user object as a response
    } catch (error) {
        console.error("Error in CheckAuth controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
