import { useMutation, useQuery } from "@tanstack/react-query";
import {
  clientSignup,
  clientCreateAccount,clientResendOtp,clientLogin
} from "../services/ApiServiceClient";

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