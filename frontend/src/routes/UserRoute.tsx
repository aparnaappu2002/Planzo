import {Route,Routes} from 'react-router-dom'
import SignupForm from '@/components/client/signup/ClientSignup'





const UserRoute=()=>{
    return(
        <Routes>
            <Route path='/signup' element={<SignupForm/>}></Route>
        </Routes>
    )
}

export default UserRoute