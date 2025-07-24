import { BrowserRouter,Routes,Route } from "react-router-dom";
import UserRoute from "./routes/UserRoute";




function App() {
  return (
   <>
   <BrowserRouter>
   <Routes>
    <Route path="/*" element={<UserRoute/>}></Route>
   </Routes>
   
   </BrowserRouter>
   
   
   </>
  );
}

export default App