import { adminLogin,unblockClient,blockClient,fetchClientsAdmin,
    fetchVendorsAdmin,blockVendor,unblockVendor,fetchPendingVendorsAdmin,approvePendingVendor,rejectPendingVendor,searchClients,searchVendors,
    findWalletAdmin,createCategory,findAllCategory,updateCategory,changeStatusCategory,findEventsInAdminSide,findTransactionsByPaymentStatus,
    dashBoardAdminDetatils
 } from "@/services/ApiServiceAdmin";
import { useMutation,useQuery } from "@tanstack/react-query";
import { CategoryUpdate } from "@/types/CategoryUpdate";
import { CreateCategoryData } from "@/types/Category";

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

export const useFindAllCategories = (currentPage: number) => {
    return useQuery({
        queryKey: ['categories', currentPage],
        queryFn: () => {
            return findAllCategory(currentPage)

        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000
    })
}

interface Category { title: string; image: File | null; }


export const useCreateCategory = () => {
    return useMutation({
        mutationFn: ({ title, image }: CreateCategoryData) => createCategory({ title, image }),

    })
}

export const useChangeStatusCategory = () => {
    return useMutation({
        mutationFn: (categoryId: string) => changeStatusCategory(categoryId)
    })
}

export const useUpdateCategory = () => {
    return useMutation({
        mutationFn: ({ categoryId, updates }: { categoryId: string, updates: CategoryUpdate }) => updateCategory(categoryId, updates)
    })
}

export const useFindEventsInAdmin = (pageNo: number) => {
    return useQuery({
        queryKey: ['eventsInAdmin', pageNo],
        queryFn: () => findEventsInAdminSide(pageNo)
    })
}

export const useFindTransactionsByPaymentStatus = (
  paymentStatus: "credit" | "debit",
  pageNo: number,
  sortBy: string = "newest"
) => {
  return useQuery({
    queryKey: ["transactionsByPaymentStatus", paymentStatus, pageNo, sortBy],
    queryFn: () =>
      findTransactionsByPaymentStatus(paymentStatus, pageNo, sortBy),
    enabled: !!paymentStatus, 
    
  });
};
export const useFindDashboardAdminDetails = (adminId: string) => {
    return useQuery({
        queryKey: ['adminDashboardDetails', adminId],
        queryFn: () => dashBoardAdminDetatils(adminId)
    })
}
