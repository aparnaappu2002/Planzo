import { isAxiosError } from "axios";
import axios from "../axios/clientAxios";
import clodAxios from 'axios'

interface Login{
    email:string,
    password:string
}

interface FormValues{
    name:string,
    email:string,
    phone:string,
    password:string,
    confirmPassword:string
}

export const clientSignup = async (values:FormValues)=>{
    try{
        const response=await axios.post('/signup',values)
        return response?.data
    }catch(error){
        console.log("Error while client signup",error)
        if(isAxiosError(error)){
            throw new Error(error?.response?.data?.error)
        }
        throw new Error("Error while client signup")
    }
}

export const clientCreateAccount = async({formdata,otpString} : {formdata:Record<string, string | number | boolean >; otpString:string})=>{
    try{
        const response=await axios.post("/createAccount",{formdata,otpString})
        return response.data
    }catch(error){
        console.log("Error while client create account",error)
        if(isAxiosError(error)){
            throw new Error(error.response?.data?.error || "Failed to create account")
        }
        throw new Error("Error while client create account")
    }
}

export const clientResendOtp = async (email:string)=>{
    try{
        const response=await axios.post('/resendOtp',{email})
        return response.data
    }catch(error){
        console.log("error while client resend otp",error)
        if(isAxiosError(error)){
            throw new Error(error.response?.data?.error)
        }
        throw new Error("Erro while client resend otp")
    }
}