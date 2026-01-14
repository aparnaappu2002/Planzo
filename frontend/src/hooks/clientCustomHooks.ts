import {useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  clientSignup,
  clientCreateAccount,clientResendOtp,clientLogin,clientForgetPasswordEmail,clientGoogleLogin,
  clientForgetPassword,changePasswordClient,updateProfileClient,findevents,findEventById,createTicket,confirmTicketAndPayment,searchEvents,
  findEventsNearToUser,findTicketAndEventDetailsClient,ticketCancel,findWalletOfClient,findEventsBasedOnCategory,clientFindCategory,searchEventsOnLocation,
  fetchVendorForCarousal,findVendorProfileWithSample,fetchServiceForClient,clientFindServiceOnCategoryBasis,searchService,fetchServiceDetailsWithVendor,createBooking,
  fetchBookingInClient,createBookingPayment,confirmBookingPayment,cancelBooking,loadChats,loadPreviousChat,addReview,showReviews,findTicketsByStatus,
  singleNotificationRead,deleteAllNotificationsClient,deleteSingleNotificationClient

} from "../services/ApiServiceClient";
import { ReviewEntity } from "@/types/ReviewEntity";
import { ClientUpdateProfileEntity } from "@/types/ClientUpdateProfileType";
import { TicketEntity } from "@/types/TicketPaymentType";
import { BookingType } from "@/types/BookingType";


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

interface TicketCancelParams {
  ticketId: string;
  refundMethod?: string;
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
      vendorId,
    }: {
      ticket: TicketEntity;
      totalCount: number;
      totalAmount: number;
      vendorId: string;
    }) =>
      createTicket(ticket, totalCount, totalAmount, vendorId),
  });
};


export const useConfirmTicketAndPayment = () => {
  return useMutation({
    mutationFn: ({
      tickets,
      allTickets, 
      ticket,     
      paymentIntent,
      vendorId,
      totalTickets
    }: {
      tickets?: TicketEntity[];      
      allTickets?: TicketEntity[];   
      ticket?: TicketEntity;         
      paymentIntent: string;
      vendorId: string;
      totalTickets?: number;
    }) => {
      
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
    mutationFn: (params: TicketCancelParams) => ticketCancel(params),
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

export const useFindVendorForCarousal = () => {
  return useQuery({
    queryKey: ["vendorForCarousal"],
    queryFn: fetchVendorForCarousal,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFindVendorProfileWithSample = (
  vendorId: string,
  pageNo: number
) => {
  return useQuery({
    queryKey: ["vendorProfileWithSample", vendorId, pageNo],
    queryFn: () => findVendorProfileWithSample(vendorId, pageNo),
  });
};

export const useFindServiceForclient = (currentPage: number) => {
  return useQuery({
    queryKey: ["services", currentPage],
    queryFn: () => fetchServiceForClient(currentPage),
    refetchOnWindowFocus: false,
  });
};
export const useFindServiceOnCategoryBasis = (
  categoryId: string,
  pageNo: number,
  sortBy: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["servicesOnCategoryBasis", categoryId, pageNo, sortBy],
    queryFn: () => clientFindServiceOnCategoryBasis(categoryId, pageNo, sortBy),
    enabled: options?.enabled,
    
  });
};
export const useFindServiceUsingSearch = () => {
  return useMutation({
    mutationFn: (query: string) => searchService(query),
  });
};

export interface Booking {
  date: Date[];
  email: string;
  phone: number;
  name: string;
  vendorId: string;
  serviceId: string;
  clientId: string;
}

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: (booking: Booking) => createBooking(booking),
  });
};

export const useFindServiceDataWithVendor = (
  serviceId: string,
  pageNo: number,
  rating: number
) => {
  return useQuery({
    queryKey: ["serviceDataWithVendor"],
    queryFn: () => fetchServiceDetailsWithVendor(serviceId, pageNo, rating),
    refetchOnWindowFocus: true,
  });
};

export const useFetchBookingsInClient = (clientId: string, pageNo: number) => {
  return useQuery({
    queryKey: ["Bookings in client"],
    queryFn: () => fetchBookingInClient(clientId, pageNo),

    refetchOnWindowFocus: false,
  });
};

export const useCreateBookingPayment = () => {
  return useMutation({
    mutationFn: ({
      bookingId,
      paymentIntentId,
    }: {
      bookingId: string;
      paymentIntentId: string;
    }) => createBookingPayment(bookingId, paymentIntentId),
  });
};

export const useConfirmBookingPayment = () => {
  return useMutation({
    mutationFn: ({
      booking,
      paymentIntentId,
    }: {
      booking: BookingType;
      paymentIntentId: string;
    }) => confirmBookingPayment(booking, paymentIntentId),
  });
};
export const useCancelBooking = () => {
  return useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
  });
};

export const useLoadMessageInfinite = (
  chatId: string,
  options?: { enabled?: boolean }
) => {
  return useInfiniteQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: ({ pageParam: Pageno }) => loadPreviousChat(chatId, Pageno),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: options?.enabled,
    
  });
};

export const useLoadChatsInfinite = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ["chats", userId],
    queryFn: ({ pageParam: pageNo }) => loadChats(userId, pageNo),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};



export const useAddReview = () => {
  return useMutation({
    mutationFn: (review: ReviewEntity) => addReview(review),
  });
};

export const useShowReviews = ({
  targetId,
  pageNo,
  rating,
}: {
  targetId: string;
  pageNo: number;
  rating: number;
}) => {
  return useQuery({
    queryKey: ["reviews", targetId, pageNo, rating],
    queryFn: () => showReviews(targetId, pageNo, rating),
  });
};

export const useFindTicketsByStatus = (
  ticketStatus: string,
  paymentStatus: string,
  pageNo: number,
  sortBy: string
) => {
  return useQuery({
    queryKey: ["ticketByStatus", ticketStatus, paymentStatus, pageNo, sortBy],
    queryFn: () => findTicketsByStatus(ticketStatus, paymentStatus, pageNo, sortBy),
    enabled: !!ticketStatus || !!paymentStatus || !!sortBy,
  });
};

export const useReadSingleNotification = () => {
  return useMutation({
    mutationFn: (notificationId: string) =>
      singleNotificationRead(notificationId),
  });
};
export const useDeleteAllNotificationsClient = () => {
  return useMutation({
    mutationFn: (userId: string) => deleteAllNotificationsClient(userId),
  });
};

export const useDeleteSingleNotificationsClient = () => {
  return useMutation({
    mutationFn: (notificationId: string) =>
      deleteSingleNotificationClient(notificationId),
  });
};
