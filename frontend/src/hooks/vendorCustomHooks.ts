import { vendorSignup,verifyOtpVendor,vendorLogin,resendOtpVendor,
    uploadImageCloudinary
 } from "@/services/ApiServiceVendor";
import {useMutation , useQuery} from '@tanstack/react-query'
import { email } from "zod";



interface FormValues{
    name:string,
    email:string,
    phone:string,
    password:string,
    confirmPassword:string,
    idProof:string
}

export const useVendorSignupMutation=()=>{
    return useMutation({
        mutationFn:async(vendor:FormValues)=>{
            return await vendorSignup(vendor)
        }
    })
}

export const useVendorVerifyOtpMutation=()=>{
    return useMutation({
        mutationFn:async({formdata,otpString}:{formdata:Record<string,string | number | boolean>;otpString:string})=>{
            return await verifyOtpVendor({formdata,otpString})
        }
    })
}

export const useVendorResendOtpMutation =()=>{
    return useMutation({
        mutationFn:async(email:string)=>{
            return await resendOtpVendor(email)
        }
    })
}

export const useUploadImageMutation=()=>{
    return useMutation({
        mutationFn:async(formData:FormData)=>{
            return await uploadImageCloudinary(formData)
        }
            
    })
}

export const useVendorLoginMutation =()=>{
    return useMutation({
        mutationFn:({email,password} : {email:string,password:string}) => {
            return vendorLogin(email,password)
        }
    })
}

