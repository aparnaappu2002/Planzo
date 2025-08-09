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




const UserRoute=()=>{
    return(
        <Routes>
            <Route path='/signup' element={<SignupForm/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/' element={<HomePage/>}></Route>
            <Route path='/forgotPassword' element={<ForgotPassword/>}></Route>
            <Route path='/resetPassword/:token?' element={<PasswordReset/>}></Route>
            <Route path='/profile' element={<ProtectedRouteClient> <ClientProfile/> </ProtectedRouteClient> }></Route>
            <Route path='/events' element={ <EventsList/>  }></Route>
            <Route path='/event/:eventId' element={ <EventDetail/> }></Route>
             <Route path='/ticketPayment' element={<ProtectedRouteClient> <TicketPaymentForm/> </ProtectedRouteClient> }></Route>
        </Routes>
    )
}

export default UserRoute