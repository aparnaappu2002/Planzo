import { Route,Routes } from "react-router-dom";
import AdminLogin from "@/components/admin/login/AdminLogin";
import { AdminLayout } from "@/components/admin/sidebar/Layout";
import Dashboard from "@/components/admin/dashboard/Dashboard";
import UserManagement from "@/components/admin/usermanagement/UserManagement"
import VendorManagement from "@/components/admin/vendormanagement/VendorManagement";
import PendingVendors from "@/components/admin/pendingVendors/PendingVendors";
import ProtectedRouteAdmin from "@/protectRoute/protectRouteAdmin";
const AdminRoute=()=>{
    return(
        <Routes>
            <Route path="login" element={<AdminLogin/>} ></Route>
            <Route path="/" element={<AdminLayout/>} >
            <Route path="dashboard" element={<ProtectedRouteAdmin> <Dashboard/> </ProtectedRouteAdmin>   } ></Route>
            <Route path="users" element={ <ProtectedRouteAdmin>  <UserManagement/>  </ProtectedRouteAdmin>  } ></Route>
            <Route path="vendors" element={<ProtectedRouteAdmin>   <VendorManagement/>  </ProtectedRouteAdmin> } ></Route>
            <Route path="pending" element={ <ProtectedRouteAdmin>  <PendingVendors/> </ProtectedRouteAdmin> } ></Route>
            </Route>
        </Routes>
    )
}
export default AdminRoute