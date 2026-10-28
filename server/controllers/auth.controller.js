import UserModel from "../models/user.model.js"
import {getToken} from "../utils/token.js"


export const googleAuth=async (req,res)=>{
    try {
        const {name,email}=req.body
        let user=await UserModel.findOne({email})
        if(!user){
            user=await UserModel.create({
                name,email
            })
        }
        let token=await getToken(user._id)
        res.cookie("token",token,{ ...cookieOptions(req), maxAge: 7 * 24 * 60 * 60 * 1000 })
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`googleSignup Error ${error}`})
    }
}

export const logOut=async (req,res)=>{
    try {
        res.clearCookie("token", cookieOptions(req))
        return res.status(200).json({message:"Logout Successfully"})
    } catch (error) {
        return res.status(500).json({message:`Logout Error ${error}`})
    }
}

function cookieOptions(req) {
    const production = req.secure || process.env.NODE_ENV === "production"
    return {
        httpOnly: true,
        secure: production,
        sameSite: production ? "none" : "lax",
        path: "/",
    }
}
