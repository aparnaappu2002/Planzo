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

export const fetchClientsAdmin = async(currentPage:number)=>{
    try{
        const response :AxiosResponse = await axios.get('/clients',{params:{pageNo:currentPage}})
        return response.data
    }catch(error){
        console.log("Error while fetching clients",error)
        if(isAxiosError(error)){
            throw new Error(error.response?.data?.error)
        }
        throw new Error("Error while fetching clients")
    }
}

export const blockClient = async(clientId:string)=>{
    try{
        const response = await axios.patch('/blockClient',{clientId})
        return response.data
    }catch(error){
        console.log("Error while blocking client",error)
        if(isAxiosError(error)) throw new Error(error.response?.data?.error)
        throw new Error("Error while blocking client")
    }
}

export const unblockClient = async(clientId:string)=>{
    try{
        const response = await axios.patch('/unblockClient',{clientId})
        return response.data
    }catch(error){
        console.log("Error while blocking client",error)
        if(isAxiosError(error)) throw new Error(error.response?.data?.error)
        throw new Error("Error while blocking client")
    }
}

export const fetchVendorsAdmin = async(currentPage:number)=>{
    try{
        const response :AxiosResponse= await axios.get('/vendors',{params:{pageNo:currentPage}})
        return response.data
    }catch(error){
        console.log('error while fetching vendors', error)
        if (isAxiosError(error)) {
            throw new Error(error.response?.data.error)
        }
        throw new Error('error while fetching vendors')
    }
}

export const blockVendor = async (vendorId: string) => {
    try {
        const response = await axios.patch('/blockVendor', { vendorId })
        return response.data
    } catch (error) {
        console.log('error while blocking vendor', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('error while blocking vendor')
    }
}

export const unblockVendor = async (vendorId: string) => {
    try {
        const response = await axios.patch('/unblockVendor', { vendorId })
        return response.data
    } catch (error) {
        console.log('error while unblocking vendor', error)
        if (isAxiosError(error)) throw new Error(error.response?.data.error)
        throw new Error('error while unblocking vendor')
    }
}

export const fetchPendingVendorsAdmin = async (currentPage: number) => {
    try {
        const response: AxiosResponse = await axios.get('/pendingVendors', { params: { pageNo: currentPage } })
        return response.data
    } catch (error) {
        console.log('error while fetching pendingVendors', error)
        if (isAxiosError(error)) {
            throw new Error(error.response?.data.error)
        }
        throw new Error('error while fetching pendingVendors')
    }
}

export const approvePendingVendor = async ({ vendorId, newStatus }: { vendorId: string, newStatus: string }) => {
    try {
        const response = await axios.patch('/approveVendor', { vendorId, newStatus })
        return response.data
    } catch (error) {
        console.log('error while approving pending vendor', error)
        if (isAxiosError(error)) {
            throw new Error(error?.response?.data?.error)
        }
        throw new Error('error while approving pending vendor')
    }
}

export const rejectPendingVendor = async ({ vendorId, newStatus, rejectionReason }: { vendorId: string, newStatus: string, rejectionReason: string }) => {
    try {
        const response = await axios.patch('/rejectVendor', { vendorId, newStatus, rejectionReason })
        return response.data
    } catch (error) {
        console.log('error while rejecting vendor', error)
        if (isAxiosError(error)) {
            throw new Error(error?.response?.data?.error)
        }
        throw new Error('error while rejecting vendor')
    }
}

export const searchClients = async (search: string) => {
    try {
        const response = await axios.get(`/search?search=${encodeURIComponent(search)}`);
        return response.data;
    } catch (error) {
        console.log('Error while searching clients:', error);
        if (isAxiosError(error)) {
            throw new Error(error.response?.data?.error || 'Client search failed');
        }
        throw new Error('Unknown error while searching clients');
    }
};
export const searchVendors = async (search: string) => {
    try {
        const response = await axios.get(`/searchVendor?search=${encodeURIComponent(search)}`);
        return response.data;
    } catch (error) {
        console.log('Error while searching vendors:', error);
        if (isAxiosError(error)) {
            throw new Error(error.response?.data?.error || 'Vendor search failed');
        }
        throw new Error('Unknown error while searching vendors');
    }
};
