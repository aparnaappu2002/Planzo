import {Route,Routes} from 'react-router-dom'
import SignupForm from '@/components/client/signup/ClientSignup'
import HomePage from '@/components/client/home/Home'
import Login from '@/components/client/login/Login'
import ForgotPassword from '@/components/forgotpassword/ForgotPassword'
import PasswordReset from '@/components/forgotpassword/PasswordReset'
import ClientProfile from '@/components/client/profile/ClientProfile'
import ProtectedRouteClient from '@/protectRoute/protectRouteUser'
import { EventsList } from '@/components/client/events/EventsList'
import EventDetail from '@/components/client/events/EventDetail'
import TicketPaymentForm from '@/components/client/payment/TicketPayment'
import ClientLayout from '@/components/client/clientLayout/ClientLayout'
import BookedEvents from '@/components/client/bookings/BookedEvents'
import ClientWallet from '@/components/client/wallet/ClientWallet'
import VendorCarousel from '@/components/client/vendor/VendorFetching'
import VendorProfilePage from '@/components/client/vendor/VendorProfileWithSamples'
import ServicesPage from '@/components/client/service/ServicesPage'
import ServiceDetails from '@/components/client/service/serviceDetails'
import BookingsPage from '@/components/client/serviceBookings/BookingsPage'
import BookingPayment from '@/components/client/payment/booking/BookingPayment'
import { ChatPage } from '@/components/client/chat/ChatPage'






const UserRoute=()=>{
    return(
        <Routes>
            <Route path='/signup' element={<SignupForm/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/' element={<HomePage/>}></Route>
            <Route path='/forgotPassword' element={<ForgotPassword/>}></Route>
            <Route path='/resetPassword/:token?' element={<PasswordReset/>}></Route>
            <Route path='/' element={<ClientLayout/>}>
            <Route path='/profile' element={<ProtectedRouteClient> <ClientProfile/> </ProtectedRouteClient> }></Route>
            <Route path='/events' element={ <EventsList/>  }></Route>
            <Route path='/event/:eventId' element={ <EventDetail/> }></Route>
             <Route path='/ticketPayment' element={<ProtectedRouteClient> <TicketPaymentForm/> </ProtectedRouteClient> }></Route>
             <Route path='/bookings' element={<ProtectedRouteClient> <BookedEvents/> </ProtectedRouteClient> }></Route>
             <Route path='/wallet' element={<ProtectedRouteClient> <ClientWallet/> </ProtectedRouteClient> }></Route>
             <Route path='/vendors' element={ <VendorCarousel/>  }></Route>
             <Route path='/vendors/:vendorId' element={ <VendorProfilePage/>  }></Route>
             <Route path='/services' element={ <ServicesPage/>  }></Route>
             <Route path='/services/:serviceId/:vendorId' element={ <ServiceDetails/>  }></Route>
             <Route path='/serviceBookings' element={<ProtectedRouteClient> <BookingsPage/> </ProtectedRouteClient> }></Route>
             <Route path='/bookingPayment' element={<ProtectedRouteClient> <BookingPayment/> </ProtectedRouteClient> }></Route>
             <Route path='/chat' element={<ProtectedRouteClient> <ChatPage/> </ProtectedRouteClient> }></Route>
             </Route>

            
        </Routes>
    )
}

export default UserRoute