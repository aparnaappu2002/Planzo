import { BrowserRouter,Routes,Route } from "react-router-dom";
import UserRoute from "./routes/UserRoute";
import VendorRoute from "./routes/VendorRoute";
import AdminRoute from "./routes/AdminRoute";




function App() {
  return (
   <>
   <BrowserRouter>
   <Routes>
    <Route path="/*" element={<UserRoute/>}></Route>
    <Route path="/vendor/*" element={<VendorRoute/>}></Route>
    <Route path="/admin/*" element={<AdminRoute/>}></Route>
   </Routes>
   
   </BrowserRouter>
   
   
   </>
  );
}

export default App