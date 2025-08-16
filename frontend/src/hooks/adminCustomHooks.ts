import { adminLogin,unblockClient,blockClient,fetchClientsAdmin,
    fetchVendorsAdmin,blockVendor,unblockVendor,fetchPendingVendorsAdmin,approvePendingVendor,rejectPendingVendor,searchClients,searchVendors,
    findWalletAdmin
 } from "@/services/ApiServiceAdmin";
import { useMutation,useQuery } from "@tanstack/react-query";

interface Login{
    email:string,
    password:string
}

export const useAdminLoginMutation =()=>{
    return useMutation({
        mutationFn:({email,password} : Login)=>adminLogin({email,password})
    })
}

export const useFetchClientsAdmin = (currentPage:number)=>{
    return useQuery({
        queryKey:['clients',currentPage],
        queryFn:()=>{
            return fetchClientsAdmin(currentPage)
        },
        refetchOnWindowFocus:false
    })
}

export const useBlockClient =()=>{
    return useMutation({
        mutationFn:(clientId:string)=>blockClient(clientId)
    })
}

export const useUnblockClient = ()=>{
    return useMutation({
        mutationFn:(clientId:string)=>unblockClient(clientId)
    })
}

export const useFetchVendorAdmin = (currentPage:number)=>{
    return useQuery({
        queryKey: ['vendors', currentPage],
        queryFn: () => {
            return fetchVendorsAdmin(currentPage)
        },
        refetchOnWindowFocus: false
    })
}

export const useBlockVendor = () => {
    return useMutation({
        mutationFn: (vendorId: string) => blockVendor(vendorId)
    })
}

export const useUnblockVendor = () => {
    return useMutation({
        mutationFn: (vendorId: string) => unblockVendor(vendorId)
    })
}

export const useFetchPendingVendors = (currentPage: number) => {
    return useQuery({
        queryKey: ['pendingVendors', currentPage],
        queryFn: () => {
            return fetchPendingVendorsAdmin(currentPage)
        },
        refetchOnWindowFocus: false
    })
}

export const useApprovePendingVendor = () => {
    return useMutation({
        mutationFn: ({ vendorId, newStatus }: { vendorId: string, newStatus: string }) => {
            return approvePendingVendor({ vendorId, newStatus })
        }
    })
}


export const useRejectPendingVendor = () => {
    return useMutation({
        mutationFn: ({ vendorId, newStatus, rejectionReason }: { vendorId: string, newStatus: string, rejectionReason: string }) => rejectPendingVendor({ vendorId, newStatus, rejectionReason })
    })
}

export const useSearchClients = (search: string) => {
    return useQuery({
        queryKey: ['searchClients', search],
        queryFn: () => searchClients(search),
        enabled: !!search && search.trim().length >= 3, 
        staleTime: 1000 * 60 * 5, 
        retry: false, 
        refetchOnWindowFocus: false, 
        refetchOnMount: false, 
        refetchOnReconnect: false,
    });
};

export const useSearchVendors = (search: string) => {
    return useQuery({
        queryKey: ['searchVendors', search],
        queryFn: () => searchVendors(search),
        enabled: !!search && search.trim().length >= 3, 
        staleTime: 1000 * 60 * 5, 
        retry: false, 
        refetchOnWindowFocus: false, 
        refetchOnMount: false, 
        refetchOnReconnect: false, 
    });
};

export const useFindAdminWallet = (userId: string, pageNo: number) => {
    return useQuery({
        queryKey: ['adminWallet', pageNo],
        queryFn: () => findWalletAdmin(userId, pageNo)
    })
}