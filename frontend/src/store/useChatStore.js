import { create } from "zustand";
import toast from "react-hot-toast";
import {axiosInstance} from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore=create((set,get)=>( {
    messages:[],
    users:[],
    selectedUser:null,
    isUsersLoding:false,
    isMessagesLoding:false,

    getUsers:async ()=>{
        set({isUsersLoding:true})
        try{
            const {data}=await axiosInstance.get("/messages/users")
            set({users:data})
        }catch(e){
            toast.error(e.message)
        }finally{
            set({isUsersLoding:false})
        }
    },

    getMessages:async (userId)=>{
        set({isMessagesLoding:true})
        try{
            const {data}=await axiosInstance.get(`/messages/${userId}`)
            set({messages:data})
        }catch(e){
            toast.error(e.message)
        }finally{
            set({isMessagesLoding:false})
        }
    },
    sendMessage:async(messageData)=>{
    const {selectedUser,messages}=get()
    try{
        const res=await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData)
        set({messages:[...messages,res.data]})
        //toast.success("Message sent successfully")
    }catch(e){
        toast.error(e.message)
    }
    },

    subscribeTomessages:()=>{
        const {selectedUser}=get()
        if(!selectedUser) return;
        const socket =useAuthStore.getState().socket;
        socket.on("newMessage",(newMessage)=>{
            const isMessageSendFromSelectedUser=newMessage.senderId===selectedUser._id;
            if(!isMessageSendFromSelectedUser) return;
            set({
                messages:[...get().messages,newMessage],
            });
        });
    },

    unsubscribeFrommessages:()=>{
        const socket =useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser:(selectedUser)=> set({selectedUser}),
}))