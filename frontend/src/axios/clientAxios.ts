import axios,{AxiosError} from "axios";
import type { AxiosRequestConfig,InternalAxiosRequestConfig } from "axios";
import { store } from "../redux/Store";
import { addToken } from "../redux/slices/user/userToken";
import authAxios from './authAxios'

const instance = axios.create({
    baseURL : import.meta.env.VITE_API_BASEURL,
    withCredentials:true
})

instance.interceptors.request.use(
    (config : InternalAxiosRequestConfig)=>{
        const token = store.getState().token.token
        if(token && config.headers){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    }
)

interface customAxiosRequestConfig extends AxiosRequestConfig{
    _retry?:boolean
}

interface CustomErrorResponse{
    code?:string
    message?:string
}

instance.interceptors.response.use(
    response => response,
    async (error :AxiosError)=>{
        const originalRequest = error.config as customAxiosRequestConfig
        const data = error.response?.data as CustomErrorResponse
        console.log("The error is :",error.response)
        if(error.response?.status===403 && data?.code ==="USER_BLOCKED"){
            window.location.href='/userBlockNotice'
            return Promise.reject(error)
        }

        if(error.response?.status ===401 && !originalRequest._retry){
            originalRequest._retry=true
            try{
                const refreshResponse = await authAxios.post<{newAccessToken:string}>("/refreshToken",{},{withCredentials:true})
                console.log("This is the refreshResponse",refreshResponse)
                const newAccessToken=refreshResponse.data.newAccessToken
                store.dispatch(addToken(newAccessToken))
                originalRequest.headers={
                    ...originalRequest.headers,Authorization:`Bearer ${newAccessToken}`
                }
                return instance(originalRequest)
            }catch(refreshError){
                window.location.href="/login"
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default instance