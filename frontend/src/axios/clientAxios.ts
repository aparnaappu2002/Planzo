import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { store } from '@/redux/Store';
import { addToken,removeToken } from '@/redux/slices/user/userToken';
import authAxios from './authAxios'
import { removeClient } from '@/redux/slices/user/userSlice';
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASEURL,
    withCredentials: true
});

instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = store.getState().token.token
        const storeToken = store.getState().token.token;
        


        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
            
        }
        return config
    }
)

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

interface CustomErrorResponse {
    code?: string;
    message?: string;
    // [key: string]: any;
}

instance.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig
        const data = error.response?.data as CustomErrorResponse;
        console.log('this is error', error.response)
        if (error.response?.status === 403 && data?.code === "USER_BLOCKED") {
            store.dispatch(removeClient())
            store.dispatch(removeToken())
            localStorage.removeItem('id')
            window.location.href = '/userBlockNotice';
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await authAxios.post<{ newAccessToken: string }>(
                    '/client/refreshToken',
                    {},
                    { withCredentials: true }
                );

                

                
                const newAccessToken = refreshResponse.data.newAccessToken;
                


                store.dispatch(addToken(newAccessToken));
                originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${newAccessToken}`,
                };

                return instance(originalRequest);

            } catch (refreshError) {
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);

    }
)

export default instance