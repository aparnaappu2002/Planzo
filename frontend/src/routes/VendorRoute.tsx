import { Route,Routes } from "react-router-dom";
import VendorSignup from "@/components/vendor/signup/VendorSignup";
import VendorLogin from "@/components/vendor/login/VendorLogin";
import ForgotPasswordVendor from "@/components/vendor/forgotpassword/ForgotPasswordVendor";
import PasswordResetVendor from "@/components/vendor/forgotpassword/PasswordResetVendor";





const VendorRoute=()=>{
    return(
        <Routes>
            <Route path="/signup" element={< VendorSignup/>}></Route>
            <Route path="/login" element={< VendorLogin/>}></Route>
            <Route path="/forgotpassword" element={< ForgotPasswordVendor/>}></Route>
            <Route path="/resetPassword/:token?" element={< PasswordResetVendor/>}></Route>

        </Routes>
    )
}

export default VendorRoute