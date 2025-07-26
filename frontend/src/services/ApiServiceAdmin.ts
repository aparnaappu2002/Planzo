import { AxiosResponse,isAxiosError } from "axios";
import axios from '../axios/adminAxios'


interface Login{
    email:string,
    password:string
}

export const adminLogin= async({email,password}:Login)=>{
    try{
        const response = await axios.post('/login',{email,password})
        return response?.data
    }catch(error){
        console.log("Error while login admin")
        if(isAxiosError(error)){
            throw new Error(error.response?.data?.error)
        }
        throw new Error('Error while login admin')
    }
}