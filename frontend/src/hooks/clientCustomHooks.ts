import { useMutation, useQuery } from "@tanstack/react-query";
import {
  clientSignup,
  clientCreateAccount,clientResendOtp,clientLogin,clientForgetPasswordEmail,clientGoogleLogin,
  clientForgetPassword,changePasswordClient,updateProfileClient
} from "../services/ApiServiceClient";
import { ClientUpdateProfileEntity } from "@/types/ClientUpdateProfileType";


type LoginProps = {
  email: string;
  password: string;
};

interface FormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

type Client={
  email:string,
  googleVerified:boolean,
  name:string,
  profileImage:string
}

export const useClientSignupMutation = () => {
  return useMutation({
    mutationFn: (values: FormValues) => clientSignup(values),
  });
};

export const useCreateAccountMutation = () => {
  return useMutation({
    mutationFn: ({
      formdata,
      otpString,
    }: {
      formdata: Record<string, string | boolean | number>;
      otpString: string;
    }) => 
      clientCreateAccount({ formdata, otpString })
  });
};

export const useResendOtpClientMutation =()=>{
  return useMutation({
    mutationFn:(email:string)=>clientResendOtp(email)
  })
}

export const useClientLoginMutation=()=>{
  return useMutation({
    mutationFn:({ email,password}:LoginProps)=>
      clientLogin({email,password})
  })
}

export const useClientSendForgotPassword=()=>{
  return useMutation({
    mutationFn:(email:string)=>clientForgetPasswordEmail(email)
  })
}

export const useClientForgotPassword=()=>{
  return useMutation({
    mutationFn:({
      email,newPassword,token 
    } :{ email:string,newPassword:string,token:string
    })=>clientForgetPassword({email,newPassword,token})
  })
}

export const useClientGoogleLoginMutation =()=>{
  return useMutation({
    mutationFn:(client : Client )=>clientGoogleLogin(client)
  })
}

export const useUpdateClientProfie = () => {
  return useMutation({
    mutationFn: (client: ClientUpdateProfileEntity) =>
      updateProfileClient(client),
  });
};

export const useChangePasswordClient = () => {
  return useMutation({
    mutationFn: ({
      userId,
      oldPassword,
      newPassword,
    }: {
      userId: string;
      oldPassword: string;
      newPassword: string;
    }) => changePasswordClient(userId, oldPassword, newPassword),
  });
};