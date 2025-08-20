import { isAxiosError } from "axios";
import axios from "../axios/clientAxios";
import { TicketEntity } from "@/types/TicketPaymentType";


import { ClientUpdateProfileEntity } from "@/types/ClientUpdateProfileType";

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
type Client={
    email:string,
    googleVerified:boolean,
    name:string,
    profileImage:string
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

export const clientLogin = async({email,password}:Login)=>{
    try{
        const response= await axios.post('/login',{email,password})
        return response?.data

    }catch(error){
        console.log("Error while login client",error)
        if(isAxiosError(error)){
            throw new Error(error.response?.data?.error)
        }
        throw new Error("Error while login client")
    }
}

export const clientForgetPasswordEmail=async(email:string)=>{
    try{
        const response = await axios.post('/sendForgotpassword',{email})
        return response.data
    }catch(error){
        console.log("Error while sending mail for forget password",error)
        if(isAxiosError(error)){
            throw new Error(error.response?.data?.error)
        }
        throw new Error("error while sending mail for forget password")
    }
}

export const clientForgetPassword = async (
    {email,newPassword,token } : {email:string,newPassword:string,token:string}
) => {
    try{
        const response=await axios.post('/forgotPassword',{email,newPassword,token})
        return response.data
    }catch(error){
        console.log("Error while resetting the password",error)
        if(isAxiosError(error)){
            throw new Error(error?.response?.data.error)
        }
        throw new Error("Error while resetting the password")
    }
}

export const clientGoogleLogin = async(client:Client)=>{
    try{
        const response = await axios.post('/googleLogin',{client})
        return response.data
    }catch(error){
        console.log('Error while client google login',error)
        if(isAxiosError(error)){
            throw new Error(error.response?.data?.error)
        }
        throw new Error("Error while client google login")
    }
}

export const updateProfileClient = async (client: ClientUpdateProfileEntity) => {
    try {
        const response = await axios.put('/updateProfile', { client })
        return response.data
    } catch (error) {
        console.log('error while udpating client profile', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('error while updating client profile')
    }
}

export const changePasswordClient = async (userId: string, oldPassword: string, newPassword: string) => {
    try {
        const response = await axios.patch('/changePassword', { userId, oldPassword, newPassword })
        return response.data
    } catch (error) {
        console.log('error while changing password client', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('error while changing client password')
    }
}

export const findevents = async (pageNo: number) => {
    try {
        const resposne = await axios.get(`/events/${pageNo}`)
        return resposne.data
    } catch (error) {
        console.log('error while fetching events in client side', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('error while fetching events in client side')
    }
}

export const findEventById = async (eventId: string) => {
    try {
        const response = await axios.get(`/findEvent/${eventId}`)
        return response.data
    } catch (error) {
        console.log('error while finding event by id', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('error while finding event by id')
    }
}

export const createTicket = async (ticket: TicketEntity, totalCount: number, totalAmount: number, paymentIntentId: string, vendorId: string) => {
    try {
        const response = await axios.post('/createTicket', { ticket, totalCount, totalAmount, paymentIntentId, vendorId })
        return response.data
    } catch (error) {
        console.log('error while creating ticket', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while creating ticket')
    }

}

export const confirmTicketAndPayment = async (ticket: TicketEntity, paymentIntent: string, vendorId: string) => {
    try {
        const response = await axios.post('/confirmTicket', { ticket, paymentIntent, vendorId })
        return response.data
    } catch (error) {
        console.log('error while confirming ticket and payment', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while confirming ticket and payment')
    }
}

export const searchEvents = async (query: string) => {
    try {
        const response = await axios.get('/events/search', { params: { query } })
        console.log(response)
        return response.data
    } catch (error) {
        console.log('error while finding events based on query', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while finding events based on query')
    }
}

export const findEventsNearToUser = async (latitude: number, longitude: number, pageNo: number, range: number) => {
    try {
        const response = await axios.get(`/eventsNearToUse/${latitude}/${longitude}/${pageNo}/${range}`)
        return response.data
    } catch (error) {
        console.log('error while finding events near to user', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while finding events near to user')
    }
}

export const findTicketAndEventDetailsClient = async (clientId: string, pageNo: number) => {
    try {
        console.log(clientId)
        const response = await axios.get(`/bookings/${clientId}/${pageNo}`)
        return response.data
    } catch (error) {
        console.log('error while fetching ticketAndEventDetails', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while fetching ticketAndEvent details')
    }
}

export const ticketCancel = async (ticketId: string) => {
    try {
        const response = await axios.patch('/ticketCancel', { ticketId })
        return response.data
    } catch (error) {
        console.log('error while ticket cancellation', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'erro while ticket cancellation')
    }
}

export const findWalletOfClient = async (clientId: string, pageNo: number) => {
    try {
        const response = await axios.get(`/wallet/${clientId}/${pageNo}`)
        return response.data
    } catch (error) {
        console.log('error while finding wallet of client', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while finding wallet of client')
    }
}

export const findEventsBasedOnCategory = async (category: string, pageNo: number, sortBy: string) => {
    try {
        const response = await axios.get(`/events/${category}/${pageNo}/${sortBy}`)
        return response.data
    } catch (error) {
        console.log('error while fetching events based on category', error)
        throw new Error(isAxiosError(error) ? error.response?.data.error : 'error while fetching events based on category')
    }
}

export const clientFindCategory = async () => {
    try {
        const response = await axios.get('/categories')
        return response.data
    } catch (error) {
        console.log('error while fetching category', error)
        if (isAxiosError(error)) {
            throw new Error(error.response?.data.error)
        }
        throw new Error('error while fetching category')
    }
}


