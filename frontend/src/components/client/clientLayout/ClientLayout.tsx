import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Footer from "../home/Footer";

function ClientLayout(){
    return(
        <div className="w-full flex flex-col">
            <Navbar/>
            <div className="grow">
                <Outlet />
            </div>
            <Footer/>
        </div>
    )
}

export default ClientLayout