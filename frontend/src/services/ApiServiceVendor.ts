import { boolean, email, number } from 'zod'
import axios from '../axios/vendorAxios'
import clodAxios,{ isAxiosError } from 'axios'
import { EventEntity } from '@/types/EventType'
import { EventUpdateEntity } from '@/types/EventUpdateEntity'
import { WorkSamplesEntity } from '@/types/WorkSampleEntity'
import { Period } from '@/types/DatePeriodType'


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

export const updateVendorDetails = async (id: string, about: string, phone: string, name: string) => {
    try {
        const response = await axios.patch('/updateDetails', { id, about, phone, name })
        return response.data
    } catch (error) {
        console.log('error while updating vendor details', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('error while updating vendor details')
    }
}

export const changePasswordVendor = async (userId: string, newPassword: string, oldPassword: string) => {
    try {
        const response = await axios.patch('/changePassword', { userId, oldPassword, newPassword })
        return response.data
    } catch (error) {
        console.log('error while changing password vendor', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('error whiel changing password vendor')
    }
}

export const createEvent = async (event: EventEntity, vendorId: string) => {
    try {
        const response = await axios.post(`/createEvent/${vendorId}`, { event })
        return response.data
    } catch (error) {
        console.log('error while creating event', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('Error whilw creating event')
    }
}

export const findAllEventsInVendor = async (vendorId: string, pageNo: number) => {
    try {
        const response = await axios.get(`/showEvents/${pageNo}/${vendorId}`)
        return response.data
    } catch (error) {
        console.log('error while fetching events in vendor side', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('error while fetching events in vendor side')
    }
}

export const updateEvent = async (eventId: string, update: EventUpdateEntity) => {
    try {
        const response = await axios.put('/updateEvent', { eventId, update })
        return response.data
    } catch (error) {
        console.log('error while updating event', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('Error while updating event')
    }
}

export const findWalletDetailsVendor = async (userId: string, pageNo: number) => {
    try {
        const response = await axios.get(`/wallet/${userId}/${pageNo}`)
        return response.data
    } catch (error) {
        console.log('error while finding the wallet details', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while finding wallet details')
    }
}

export const ticketDetailsWithUser = async ( vendorId: string, pageNo: number) => {
    try {
        const response = await axios.get('/ticketDetailsWithUser', { params: { vendorId, pageNo } })
        return response.data
    } catch (error) {
        console.log('error while finding the ticket details with user', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while finding the ticket details with user')
    }
}
export const vendorLogout = async () => {
    try {
        const response = await axios.post('/logout')
        return response.data
    } catch (error) {
        console.log('error while logout', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('error while logout')
    }
}

export const createWorkSamples = async (workSample: WorkSamplesEntity) => {
    try {
        const response = await axios.post('/createWorkSample', { workSample })
        return response.data
    } catch (error) {
        console.log('error while creating work sample', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while creating work samples')
    }
}

export const findWorkSamples = async (vendorId: string, pageNo: number) => {
    try {
        const response = await axios.get('/workSamples', { params: { vendorId, pageNo } })
        return response.data
    } catch (error) {
        console.log('error while finding the work samples', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while finding work samples')
    }
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

export const fetchCategoryCategoryForService = async () => {
    try {
        const response = await axios.get('/categories')
        return response.data
    } catch (error) {
        console.log('error while fetching category', error)
        if (isAxiosError(error)) {
            throw new Error(error?.response?.data?.error)
        }
        throw new Error('error while fetching category for service')
    }
}
export const createServiceVendor = async (service: Service) => {
    try {
        const response = await axios.post('/createService', { service })
        return response.data
    } catch (error) {
        console.log('error while creating service', error)
        if (isAxiosError(error)) {
            throw new Error(error?.response?.data?.error)
        }
        throw new Error('error while creating service')
    }
}

export const findServiceForVendor = async ({ vendorId, pageNo }: { vendorId: string, pageNo: number }) => {
    try {

        const response = await axios.get('/services', { params: { vendorId, pageNo } })
        return response.data
    } catch (error) {
        console.log('error while fetching service', error)
        if (isAxiosError(error)) {
            throw new Error(error.response?.data.error)
        }
        throw new Error('error while fetching service')
    }
}

export const editServiceVendor = async (service: Service, serviceId: string) => {
    try {
        const response = await axios.put('/editService', { service, serviceId })
        return response.data
    } catch (error) {
        console.log('error while editing service', error)
        if (isAxiosError(error)) {
            throw new Error(error.response?.data.error)
        }
        throw new Error('error while editing service')
    }
}

export const changeStatusService = async (serviceId: string) => {
    try {
        const response = await axios.patch('/changeStatusService', { serviceId })
        return response.data
    } catch (error) {
        console.log('error while changing the status of the service', error)
        if (isAxiosError(error)) {
            throw new Error(error?.response?.data.error)
        }
        throw new Error('error while changing the status of the service')
    }
}

export const showBookingsInVendor = async (vendorId: string, pageNo: number) => {
    try {
        const response = await axios.get(`/showBookings/${vendorId}/${pageNo}`)
        return response.data
    } catch (error) {
        console.log('error while fetching bookings in vendor side', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.message)
        throw new Error('error while fetching bookings in vendor side')
    }
}

export const approveBookingVendor = async (bookingId: string) => {
    try {
        const response = await axios.patch('/approveBooking', { bookingId })
        return response.data
    } catch (error) {
        console.log('error while approving booking in vendor side', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('error whilw approving booking in vendor side')
    }
}

export const rejectBooking = async (bookingId: string, rejectionReason: string) => {
    try {
        const response = await axios.patch('/rejectBooking', { bookingId, rejectionReason })
        return response.data
    } catch (error) {
        console.log('error while rejecting booking', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('error while rejecting booking')
    }
}

export const updateBookingAsComplete = async (bookingId: string, status: string) => {
    try {
        const response = await axios.patch('/completeBooking', { bookingId, status })
        return response.data
    } catch (error) {
        console.log('error while updating booking as complete', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while updating booking as complete')
    }
}

export const loadPreviousChatVendor = async (chatId: string, pageNo: number) => {
    try {
        const response = await axios.get('/loadPreviousChat', { params: { chatId, pageNo } })
        return response.data
    } catch (error) {
        console.log('error while loading previous chat', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while loading previous messages')
    }
}


export const loadChatsVendor = async (userId: string, pageNo: number) => {
    try {
        const response = await axios.get('/chats', { params: { userId, pageNo } })
        return response.data
    } catch (error) {
        console.log('error while finding the chats of user', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while findng the chats of user')
    }
}

export const verifyTicket = async (ticketId: string, eventId: string) => {
    try {
        const response = await axios.post('/verifyTicket', { ticketId, eventId })
        return response.data
    } catch (error) {
        console.log('error while verifying ticket', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while verifying ticket')
    }
}

export const findTransactionsByPaymentStatus = async (
  paymentStatus: "credit" | "debit",
  pageNo: number,
  sortBy: string = "newest"
) => {
  try {
    const response = await axios.get(`/transactions`, {
      params: {
        paymentStatus,
        pageNo,
        sortBy
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error while fetching transactions by payment status", error);
    throw new Error(
      isAxiosError(error)
        ? error.response?.data.message || "Failed to fetch transactions"
        : "Unexpected error while fetching transactions"
    );
  }
};

export const loadVendorDashboard = async (vendorId: string, datePeriod: Period) => {
    try {
        const response = await axios.get('/vendorDashboard', { params: { vendorId, datePeriod } })
        return response.data
    } catch (error) {
        console.log('error while fetching vendor dashboard details', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while fetching vendor dashboard details')
    }
}
export const pdfDownloadVendor = async (vendorId: string) => {
    try {
        const response = await axios.post('/pdfDownload', { vendorId }, { responseType: 'blob' })
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'vendor_report.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    } catch (error) {
        console.log('error while downloading pdf for the vendor', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while downloading pdf for the vendor')
    }
}