import { Route,Routes } from "react-router-dom";
import AdminLogin from "@/components/admin/login/AdminLogin";


const AdminRoute=()=>{
    return(
        <Routes>
            <Route path="login" element={<AdminLogin/>} ></Route>
        </Routes>
    )
}
export default AdminRoute