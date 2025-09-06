import { useMutation, useQuery } from "@tanstack/react-query";
import {
  clientSignup,
  clientCreateAccount,clientResendOtp,clientLogin,clientForgetPasswordEmail,clientGoogleLogin,
  clientForgetPassword,changePasswordClient,updateProfileClient,findevents,findEventById,createTicket,confirmTicketAndPayment,searchEvents,
  findEventsNearToUser,findTicketAndEventDetailsClient,ticketCancel,findWalletOfClient,findEventsBasedOnCategory,clientFindCategory,searchEventsOnLocation

} from "../services/ApiServiceClient";
import { ClientUpdateProfileEntity } from "@/types/ClientUpdateProfileType";
import { TicketEntity } from "@/types/TicketPaymentType";


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

export const useFindEvents = (pageNo: number) => {
  return useQuery({
    queryKey: ["events", pageNo],
    queryFn: () => findevents(pageNo),
  });
};

export const useFindEventById = (eventId: string) => {
  return useQuery({
    queryKey: ["eventById", eventId],
    queryFn: () => findEventById(eventId),
  });
};

export const useCreateTicket = () => {
  return useMutation({
    mutationFn: ({
      ticket,
      totalCount,
      totalAmount,
      paymentIntentId,
      vendorId,
    }: {
      ticket: TicketEntity;
      totalCount: number;
      totalAmount: number;
      paymentIntentId: string;
      vendorId: string;
    }) =>
      createTicket(ticket, totalCount, totalAmount, paymentIntentId, vendorId),
  });
};


export const useConfirmTicketAndPayment = () => {
  return useMutation({
    mutationFn: ({
      tickets,
      allTickets, // Backup field
      ticket,     // Fallback field
      paymentIntent,
      vendorId,
      totalTickets
    }: {
      tickets?: TicketEntity[];      // Primary - array of tickets
      allTickets?: TicketEntity[];   // Backup field
      ticket?: TicketEntity;         // Fallback single ticket
      paymentIntent: string;
      vendorId: string;
      totalTickets?: number;
    }) => {
      // Determine which tickets to use with fallback logic
      const ticketsToConfirm = tickets || allTickets || (ticket ? [ticket] : []);
      
      if (ticketsToConfirm.length === 0) {
        throw new Error('No tickets provided for confirmation');
      }
      
      return confirmTicketAndPayment(
        ticketsToConfirm, 
        paymentIntent, 
        vendorId, 
        totalTickets
      );
    },
  });
};


export const useFindEventsOnQuery = () => {
  return useMutation({
    mutationFn: (query: string) => searchEvents(query),
  });
};

export const useFindEventsNearToUser = () => {
  return useMutation({
    mutationFn: ({
      latitude,
      longitude,
      pageNo,
      range,
    }: {
      latitude: number;
      longitude: number;
      pageNo: number;
      range: number;
    }) => findEventsNearToUser(latitude, longitude, pageNo, range),
  });
};

export const useFindTicketAndEventsDetails = (
  clientId: string,
  pageNo: number
) => {
  return useQuery({
    queryKey: ["ticketAndEventDetaills", pageNo],
    queryFn: () => findTicketAndEventDetailsClient(clientId, pageNo),
  });
};

export const useTicketCancellation = () => {
  return useMutation({
    mutationFn: (ticketId: string) => ticketCancel(ticketId),
  });
};

export const useFindWalletClient = (clientId: string, pageNo: number) => {
  return useQuery({
    queryKey: ["walletClient", pageNo],
    queryFn: () => findWalletOfClient(clientId, pageNo),
  });
};

export const useFindEventsBasedOnCategory = (
  category: string,
  pageNo: number,
  sortBy: string
) => {
  return useQuery({
    queryKey: ["eventsBasedOnCategory", category, pageNo, sortBy],
    queryFn: () => findEventsBasedOnCategory(category, pageNo, sortBy),
    enabled: !!category || !!sortBy,
  });
};

export const useFindCategoryClient = () => {
  return useQuery({
    queryKey: ["categoriesClient"],
    queryFn: clientFindCategory,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useSearchEventsOnLocation = (
    locationQuery: string,
    pageNo: number,
    limit: number,
    range: number
) => {
    return useQuery({
        queryKey: ["searchEventsOnLocation", locationQuery, pageNo, limit, range],
        queryFn: () => searchEventsOnLocation(locationQuery, pageNo, limit, range),
        enabled: !!locationQuery,
    });
};