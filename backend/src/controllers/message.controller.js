import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../modules/message.model.js";
import User from "../modules/user.model.js";

 export const getUsersForSidebar =async(req,res)=>{
try {
    const loggedInUserId=req.user._id;
    const filteredUsers=await User.find({_id:{$ne:loggedInUserId}}).select("-password");
    res.status(200).json(filteredUsers)
} catch (error) {
    console.log("error in get userSidebar",error.message);
    res.status(500).json({message:"internal server error"})
}
 };

 export const getMessages=async(req,res)=>{
    try {
      const {id:userToChatId}=  req.params;
      const myId=req.user._id;

      const messages=await Message.find({
        $or:[
            {senderId:myId,receiverId:userToChatId},
            {senderId:userToChatId,receiverId:myId}
        ]
      })
      res.status(200).json(messages);

    } catch (error) {
        console.log("error in get message controller",error.message);
        res.status(500).json({message:"internal server error"})  ;
    }
 };

 export const sendMessage=async(req,res)=>{
    try {
      const {text,image}=req.body;
      const {id:receiverId}=req.params;
      const senderId=req.user._id;  

      let imageUrl;
      if(image){
        //upload base 64 to the cloudanary

        const uploadeResponce=await cloudinary.uploader.upload(image);
        console.log("Cloudinary upload response:", uploadeResponce);
        imageUrl=uploadeResponce.secure_url;
      }

      const newMessage=new Message({
        senderId,
        receiverId,
        text,
        image:imageUrl,
      });
      await newMessage.save();

    
      const receiverSoketId= getReceiverSocketId(receiverId);
      if(receiverSoketId){
        io.to(receiverSoketId).emit("newMessage",newMessage);
      }

      res.status(200).json(newMessage);
    } catch (error) {
        console.log("error in get sendMessage controller",error.message);
        res.status(500).json({message:"internal server error"})  
    }
 };