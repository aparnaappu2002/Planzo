import { boolean, email, number } from 'zod'
import axios from '../axios/vendorAxios'
import clodAxios,{ isAxiosError } from 'axios'




interface Vendor{
    name:string,
    email:string,
    phone:string,
    password:string,
    confirmPassword:string,
    idProof:string
}



export const vendorSignup = async (vendor:Vendor)=>{
    try{
        console.log("Sending vendor data:",vendor)
        const response = await axios.post('/sendOtp',vendor)
        return response.data
    }catch(error){
        console.log('Error while signup vendor',error)
        if(isAxiosError(error)){
            throw new Error(error.response?.data?.error)
        }
        throw "Error while signup vendor"
    }
}

export const verifyOtpVendor = async({formdata,otpString} : {formdata: Record<string , string | number | boolean>; otpString: string})=>{
    try{
        const response = await axios.post('/signup',{formdata,enteredOtp:otpString})
        return response.data
    }catch(error){
        if(isAxiosError(error)){
            throw new Error(error.response?.data?.message) || "Otp verification failed"
        }
        throw new Error("Unknown error occured during otp verification")
    }
}

export const resendOtpVendor = async(email:string)=>{
    try{
        const response = await axios.post('/resendOtp',{email})
        return response.data
    }catch(error){
        console.log("Error while resending otp in vendor",error)
        if(isAxiosError(error)){
            throw new Error(error?.response?.data?.error)
        }
        throw new Error("Error while resending otp")
    }
}

const CLOUDINARY_URL=import.meta.env.VITE_CLOUDINARY_URL

export const uploadImageCloudinary = async (formdata:FormData)=>{
    try{
        const response = await clodAxios.post(CLOUDINARY_URL,formdata)
        return response.data
    }catch(error){
        console.log('Error while uploading image',error)
        if(isAxiosError(error)){
            throw new Error(error.response?.data?.error)
        }
        throw "Error while uploadin image"
    }
}

export const vendorLogin = async(email:string,password:string)=>{
    try{
        const response = await axios.post('/login',{email,password})
        return response.data
    }catch(error){
        console.log("Error while vendor login",error)
        if(isAxiosError(error)){
            throw new Error(error?.response?.data?.error)
        }
        throw new Error ("Error while login vendor")
    }
}

export const vendorForgotPasswordEmail=async (email:string)=>{
    try{
        const response = await axios.post('/sendMail',{email})
        return response.data
    }catch(error){
        console.log("Error file sending email for forgot password")
        if(isAxiosError(error)){
            throw new Error(error.response?.data?.error)
        }
        throw new Error("Error while sending email for forgot password")
    }
}

export const vendorForgotPassword = async(
    {email,newPassword,token }:{email:string,newPassword:string,token:string})=>{
        try{
            const response = await axios.post('/forgotPassword',{email,newPassword,token})
            return response.data
        }catch(error){
            console.log('Error while resetting password',error)
            if(isAxiosError(error)){
                throw new Error(error?.response?.data.error)
            }
            throw new Error("Error while resetting password")
        }
    }
