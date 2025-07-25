import { Route,Routes } from "react-router-dom";
import VendorSignup from "@/components/vendor/signup/VendorSignup";





const VendorRoute=()=>{
    return(
        <Routes>
            <Route path="/signup" element={< VendorSignup/>}></Route>

        </Routes>
    )
}

export default VendorRoute