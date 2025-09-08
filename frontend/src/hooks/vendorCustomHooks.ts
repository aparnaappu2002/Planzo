import { vendorSignup,verifyOtpVendor,vendorLogin,resendOtpVendor,
    uploadImageCloudinary,vendorForgotPassword,vendorForgotPasswordEmail,updateVendorDetails,changePasswordVendor,createEvent,findAllEventsInVendor,updateEvent
,findWalletDetailsVendor,ticketDetailsWithUser,vendorLogout,createWorkSamples,findWorkSamples,
findServiceForVendor,editServiceVendor,changeStatusService,createServiceVendor,fetchCategoryCategoryForService} from "@/services/ApiServiceVendor";
import {useMutation , useQuery} from '@tanstack/react-query'
import { email } from "zod";
import { EventEntity } from "@/types/EventType";
import { EventUpdateEntity } from "@/types/EventUpdateEntity";
import { WorkSamplesEntity } from "@/types/WorkSampleEntity";



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
        mutationFn: ({ event, vendorId }: { event: EventEntity, vendorId: string }) => createEvent(event, vendorId)
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

export const useFindWalletDetailsVendor = (userId: string, pageNo: number) => {
    return useQuery({
        queryKey: ['walletVendor', pageNo],
        queryFn: () => findWalletDetailsVendor(userId, pageNo)
    })
}

export const useTicketDetailsWithUser = ( vendorId: string, pageNo: number) => {
    return useQuery({
        queryKey: ['ticketDetailsWithUser', pageNo],
        queryFn: () => ticketDetailsWithUser( vendorId, pageNo)
    })
}

export const useVendorLogout = () => {
    return useMutation({
        mutationFn: () => vendorLogout()
    })
}

export const useCreateWorkSample = () => {
    return useMutation({
        mutationFn: (workSample: WorkSamplesEntity) => createWorkSamples(workSample)
    })
}

export const useFindWorkSamples = (vendorId: string, pageNo: number) => {
    return useQuery({
        queryKey: ['workSamples', vendorId, pageNo],
        queryFn: () => findWorkSamples(vendorId, pageNo)
    })
}

interface Service {
    _id?: string;
    serviceTitle: string;
    yearsOfExperience: number;
    serviceDescription: string;
    cancellationPolicy: string;
    termsAndCondition: string;
    serviceDuration: string;
    servicePrice: number;
    additionalHourFee: number;
    status: string;
    vendorId?: string;
    categoryId: string;
}
export const useFetchCategoryForServiceQuery = () => {
    return useQuery({
        queryKey: ['categories-for-addService'],
        queryFn: () => fetchCategoryCategoryForService(),
        refetchOnWindowFocus: false,

    },
    )
}

export const useCreateServiceMutation = () => {
    return useMutation({
        mutationFn: (service: Service) => createServiceVendor(service)
    })
}

export const useFetchServiceVendor = ({ vendorId, pageNo }: { vendorId: string, pageNo: number }) => {
    return useQuery({
        queryKey: ['services-in-vendor', vendorId, pageNo],
        queryFn: () => findServiceForVendor({ vendorId, pageNo }),
        staleTime: 1000 * 60 * 5,
    })
}

export const useEditServiceVendor = () => {
    return useMutation({
        mutationFn: ({ service, serviceId }: { service: Service, serviceId: string }) => editServiceVendor(service, serviceId)
    })
}

export const useChangeStatusServiceVendor = () => {
    return useMutation({
        mutationFn: (serviceId: string) => changeStatusService(serviceId)
    })
}
