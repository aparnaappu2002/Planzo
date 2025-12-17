import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { useClientLoginMutation } from "@/hooks/clientCustomHooks";
import { useNavigate } from "react-router-dom";
import { addToken } from "@/redux/slices/user/userToken";
import { addClient } from "@/redux/slices/user/userSlice";
import { useDispatch } from "react-redux";
import {jwtDecode} from 'jwt-decode'
import { CredentialResponse,GoogleLogin } from "@react-oauth/google";
import { useClientGoogleLoginMutation } from "@/hooks/clientCustomHooks";

interface FormErrors{
    email?:string
    password?:string
  }
  type Client = {
  email: string;
  googleVerified: boolean;
  name: string;
  profileImage: string
}
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors,setErrors]=useState<FormErrors>({})
  const loginMutation = useClientLoginMutation()
  const googleLoginMutation= useClientGoogleLoginMutation()
  const navigate=useNavigate()
  const dispatch=useDispatch()

  
  const validateEmail = (email:string):string | undefined=>{
    if(!email.trim()){
      return "Email is required"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;

  }
  const validatePassword = (password:string) :string | undefined=>{
    if(!password){
      return "Password is required"
    }
    if(password.length<6){
      return " Password must be at lease 6 characters long"
    }
    return undefined
  }

  const validateForm =()=>{
    const newErrors:FormErrors={}
    const emailError=validateEmail(email)
    const passwordError=validatePassword(password)

    if(emailError) newErrors.email=emailError
    if(passwordError) newErrors.password=passwordError
    setErrors(newErrors)
    return Object.keys(newErrors).length===0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!validateForm) return
    setIsLoading(true);

    try{
      const response = await loginMutation.mutateAsync({email:email.trim(),password:password})
      console.log(response)
      localStorage.setItem('clientId',response.client._id)
      dispatch(addToken(response?.accessToken))
      dispatch(addClient(response?.client))
      navigate('/')
      toast.success("Client login successfully")
    }catch(error){
      console.log('Login error:',error)
     let errorMessage = "Login failed. Please try again.";
      
      if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage); 
      
    


    }finally{
      setIsLoading(false)
    }
    
  };

  const handleGoogleLogin = async (credentialResponse:CredentialResponse)=>{
    
    try{
      if(credentialResponse.credential){
        const credential:Client = jwtDecode(credentialResponse.credential)
        console.log(credential)
        const client:Client = {
          email:credential.email,
          name:credential.name,
          googleVerified:true,
          profileImage:credential.profileImage
        }
        const response = await googleLoginMutation.mutateAsync(client)
        console.log(response)
        localStorage.setItem('clientId',response.client._id)
        dispatch(addClient(response?.client))
        dispatch(addToken(response?.accessToken))
        toast.success("Google login successfull")
        navigate('/')
      }
    }catch(error){
      let errorMessage = "Login failed. Please try again.";
      
      if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage); 
    }
  }

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      
      <div className="absolute inset-0  pointer-events-none" />
      
      
      <div className="absolute " />
      <div className="absolute " />
      <div className="absolute " />
      
      
      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full shadow-elegant backdrop-blur-sm bg-card/95 border-accent/20">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Planzo
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary bg-transparent border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <a
                  href="/forgotpassword"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-all duration-200 shadow-elegant hover:shadow-glow font-semibold text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
               <div >
                                        <GoogleLogin onSuccess={handleGoogleLogin} onError={() => console.log('login failed')} useOneTap={false}></GoogleLogin>

                                    </div>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                  onClick={()=>navigate('/signup')}
                >
                  Sign up here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;