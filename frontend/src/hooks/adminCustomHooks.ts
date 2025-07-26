import { adminLogin } from "@/services/ApiServiceAdmin";
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

