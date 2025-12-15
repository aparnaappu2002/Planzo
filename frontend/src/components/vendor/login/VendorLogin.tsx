import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useVendorLoginMutation } from "@/hooks/vendorCustomHooks";
import { addVendor } from "@/redux/slices/vendor/vendorSlice";
import { addVendorToken } from "@/redux/slices/vendor/vendorTokenSlice";
import { useDispatch } from "react-redux";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long"),
});

type FormValues = z.infer<typeof formSchema>;

export default function VendorLogin() {
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate=useNavigate()
  const vendorLoginMutation=useVendorLoginMutation()
  const dispatch=useDispatch()
  

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit =async (data: FormValues) => {
   try{
    const response= await vendorLoginMutation.mutateAsync(data)
    localStorage.setItem('vendorId',response.vendor._id)
    dispatch(addVendorToken(response.accessToken))
    dispatch(addVendor(response.vendor))
    toast.success("Login Successfull")
    navigate('/vendor/profile')
   }catch(error){
    console.log("Error while login vendor")
    const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
    toast.error(errorMessage);

   }
  };
  const handleNavigate=()=>{
    navigate('/vendor/forgotPassword')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-yellow-soft to-yellow-glow/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-yellow backdrop-blur-sm border-yellow-glow/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <LogIn className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Vendor Login
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your vendor account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 transition-smooth focus:border-primary"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-foreground font-medium">Password</FormLabel>
                <button
                  type="button"
                  onClick={handleNavigate}
                  className="text-sm text-primary hover:underline font-medium transition-smooth"
                >
                  Forgot Password?
                </button>
              </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 transition-smooth focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:bg-primary/90 text-primary-foreground font-medium transition-smooth"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button className="text-primary hover:underline font-medium transition-smooth"
              onClick={()=> navigate('/vendor/signup')}>
                Sign up here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}