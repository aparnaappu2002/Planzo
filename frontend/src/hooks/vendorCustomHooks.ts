import { vendorSignup,verifyOtpVendor,vendorLogin,resendOtpVendor,
    uploadImageCloudinary,vendorForgotPassword,vendorForgotPasswordEmail,updateVendorDetails,changePasswordVendor,createEvent,findAllEventsInVendor,updateEvent
 } from "@/services/ApiServiceVendor";
import {useMutation , useQuery} from '@tanstack/react-query'
import { email } from "zod";
import { EventType } from "@/types/EventType";
import { EventUpdateEntity } from "@/types/EventUpdateEntity";



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

export const useVendorRequestForgotPassword =()=>{
    return useMutation({
        mutationFn:(email:string)=>vendorForgotPasswordEmail(email)
    })
}

export const useVendorForgotPassword =()=>{
    return useMutation({
        mutationFn:({email,newPassword,token} : {email:string,newPassword:string,token:string})=>
            vendorForgotPassword({email,newPassword,token})
    })
}

export const useUpdateVendorDetailsMutation = () => {
    return useMutation({
        mutationFn: ({ id, about, phone, name }: { id: string, about: string, phone: string, name: string }) => updateVendorDetails(id, about, phone, name)
    })
}



export const useVendorChangePassword = () => {
    return useMutation({
        mutationFn: ({ userId, oldPassword, newPassword }: { userId: string, oldPassword: string, newPassword: string }) => changePasswordVendor(userId, oldPassword, newPassword)
    })
}

export const useCreateEvent = () => {
    return useMutation({
        mutationFn: ({ event, vendorId }: { event: EventType, vendorId: string }) => createEvent(event, vendorId)
    })
}

export const useFindAllEventsVendorSide = (vendorId: string, pageNo: number) => {
    return useQuery({
        queryKey: ['eventsInVendor', pageNo],
        queryFn: () => findAllEventsInVendor(vendorId, pageNo)
    })
}

export const useUpdateEvent = () => {
    return useMutation({
        mutationFn: ({ eventId, update }: { eventId: string, update: EventUpdateEntity }) => updateEvent(eventId, update)
    })
}