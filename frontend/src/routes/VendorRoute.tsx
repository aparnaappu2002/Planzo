import { Route,Routes } from "react-router-dom";
import VendorSignup from "@/components/vendor/signup/VendorSignup";
import VendorLogin from "@/components/vendor/login/VendorLogin";





const VendorRoute=()=>{
    return(
        <Routes>
            <Route path="/signup" element={< VendorSignup/>}></Route>
            <Route path="/login" element={< VendorLogin/>}></Route>

        </Routes>
    )
}

export default VendorRoute