import { BrowserRouter,Routes,Route } from "react-router-dom";
import UserRoute from "./routes/UserRoute";
import VendorRoute from "./routes/VendorRoute";




function App() {
  return (
   <>
   <BrowserRouter>
   <Routes>
    <Route path="/*" element={<UserRoute/>}></Route>
    <Route path="/vendor/*" element={<VendorRoute/>}></Route>
   </Routes>
   
   </BrowserRouter>
   
   
   </>
  );
}

export default App