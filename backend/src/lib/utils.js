import jwt from "jsonwebtoken"
export const genrateToken =(userId,res)=>{
const token =jwt.sign({userId},process.env.JWT_SECRET,{
    expiresIn:"7d"
})

res.cookie("jwt",token,{
    maxAge:7*24*60*60*1000,//MS
    httpOnly:true,//Privent xss attacks cross-side scripting attacks 
    sameSite:"strict",//CSRF Attaks 
    secure:process.env.NODE_ENV !== "devlopment"
});
return token;
}