import { Route,Routes } from "react-router-dom";
import VendorSignup from "@/components/vendor/signup/VendorSignup";
import VendorLogin from "@/components/vendor/login/VendorLogin";
import ForgotPasswordVendor from "@/components/vendor/forgotpassword/ForgotPasswordVendor";
import PasswordResetVendor from "@/components/vendor/forgotpassword/PasswordResetVendor";
import VendorProfile from "@/components/vendor/profile/VendorProfile";
import { VendorLayout } from "@/components/vendor/sidebar/VendorLayout";
import { EventCreation } from "@/components/vendor/event/EventCreation";
import Events from "@/components/vendor/event/updateEvent/Events";
import ProtectedRouteVendor from "@/protectRoute/protectRouteVendor";
import ProfileNotApproved from "@/components/vendor/VendorDashboard";
import VendorWallet from "@/components/vendor/wallet/VendorWallet";
import TicketAndUserDetails from "@/components/vendor/ticket/TicketAndUserDetail";
import WorkSamplesPage from "@/components/vendor/workSample/WorkSample";
import VendorServicesPage from "@/components/vendor/service/VendorServicePage";
import VendorBookingsPage from "@/components/vendor/bookings/VendorBookingsPage";
import { VendorChatPage } from "@/components/vendor/chat/VendorChatPage";
import TicketScanner from "@/components/vendor/ticket/TicketScanner";



const VendorRoute=()=>{
    return(
        <Routes>
            <Route path="/signup" element={< VendorSignup/>}></Route>
            <Route path="/login" element={< VendorLogin/>}></Route>
            <Route path="/forgotpassword" element={< ForgotPasswordVendor/>}></Route>
            <Route path="/resetPassword/:token?" element={< PasswordResetVendor/>}></Route>
            <Route path="/dashboard" element={< ProfileNotApproved/>}></Route>

            <Route path="/" element={<VendorLayout/>}>
            <Route path="/profile" element={<ProtectedRouteVendor>< VendorProfile/> </ProtectedRouteVendor>  }></Route>
            <Route path="/createEvent" element={<ProtectedRouteVendor> < EventCreation/> </ProtectedRouteVendor>  }></Route>
            <Route path="/events" element={<ProtectedRouteVendor>  < Events/> </ProtectedRouteVendor> }></Route>
            <Route path="/wallet" element={<ProtectedRouteVendor>  < VendorWallet/> </ProtectedRouteVendor> }></Route>
            <Route path="/tickets" element={<ProtectedRouteVendor>  < TicketAndUserDetails/> </ProtectedRouteVendor> }></Route>
            <Route path="/workSamples" element={<ProtectedRouteVendor>  < WorkSamplesPage/> </ProtectedRouteVendor> }></Route>
            <Route path="/services" element={<ProtectedRouteVendor>  < VendorServicesPage/> </ProtectedRouteVendor> }></Route>
            <Route path="/bookings" element={<ProtectedRouteVendor>  < VendorBookingsPage/> </ProtectedRouteVendor> }></Route>
            <Route path="/chats" element={<ProtectedRouteVendor>  < VendorChatPage/> </ProtectedRouteVendor> }></Route>
            <Route path="/scanTickets" element={<ProtectedRouteVendor>  < TicketScanner/> </ProtectedRouteVendor> }></Route>
            </Route>
        </Routes>
    )
}

export default VendorRoute