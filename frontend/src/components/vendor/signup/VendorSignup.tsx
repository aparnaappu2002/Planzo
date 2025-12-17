import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Eye, EyeOff, User, Mail, Phone, Lock, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { useVendorSignupMutation,useUploadImageMutation,useVendorResendOtpMutation,useVendorVerifyOtpMutation } from '@/hooks/vendorCustomHooks';
import OtpModal from '@/components/client/signup/OtpModal';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  idProof: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  idProof?: string;
}

const VendorSignup = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    idProof: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isOtpModalOpen,setIsOtpModalOpen]=useState(false)
  const [uploadedImageUrl,setUploadedImageUrl]=useState<string>('')
  const navigate=useNavigate()

  const uploadImageMutation=useUploadImageMutation()
  const vendorSignupMutation=useVendorSignupMutation()
  const resendVendorOtpMutation=useVendorResendOtpMutation()
  const verifyVendorMutation=useVendorVerifyOtpMutation()
  

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    
    if (!formValues.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formValues.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formValues.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formValues.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formValues.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formValues.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    
    if (!formValues.password) {
      newErrors.password = 'Password is required';
    } else if (formValues.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formValues.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    
    if (!formValues.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formValues.password !== formValues.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }


    if (!uploadedFile) {
      newErrors.idProof = 'ID proof is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));

    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFileUpload =async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          idProof: 'Please upload only image files (JPG, PNG, GIF)',
        }));
        return;
      }

      
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          idProof: 'File size must be less than 5MB',
        }));
        return;
      }

      setUploadedFile(file);
      setFormValues(prev => ({
        ...prev,
        idProof: file.name,
      }));

      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrors(prev => ({
        ...prev,
        idProof: undefined,
      }));

      try{
        const formData=new FormData()
        formData.append("file", file)
      formData.append("upload_preset", "Planzo")
      const response=await uploadImageMutation.mutateAsync(formData)
      setUploadedImageUrl(response.url)
      }catch(error){
        console.error("Image upload error:",error)
        toast.error("Failed to upload image")
        setErrors(prev=>({
            ...prev,
            idProof:'Failed to upload image'
        }))
      }
    }
  };

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
    console.log('Form validation failed');
    return;
  }
  
  // Check if image upload is complete
  if (!uploadedImageUrl) {
    toast.error('Please wait for image upload to complete');
    return;
  }

        try{
            const vendorData={
                ...formValues,
                idProof:uploadedImageUrl
            }
            const response=await vendorSignupMutation.mutateAsync(vendorData)
            setIsOtpModalOpen(true)
            toast.success(response.mess)
        }catch(error){
           const errorMessage = error instanceof Error ? error.message : "Signup Failed";
               toast.error(errorMessage);
        }
    
  };

  const handleResend = () => {
    
    return resendVendorOtpMutation.mutateAsync(formValues.email)
  }

  const handleOtpVerifySuccess = () => {
    
    setFormValues({
     name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    idProof: '',
    });
    toast.success("Account created successfully")
    navigate('/vendor/login')
  };

  return (
   <>
    <div className="min-h-screen bg-gradient-to-br from-background via-yellow-soft to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-yellow)] border-yellow-glow/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Vendor Registration
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Join our platform and start selling today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  className={`pl-10 transition-[var(--transition-smooth)] ${
                    errors.name ? 'border-destructive' : 'border-input focus:border-primary'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  className={`pl-10 transition-[var(--transition-smooth)] ${
                    errors.email ? 'border-destructive' : 'border-input focus:border-primary'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formValues.phone}
                  onChange={handleInputChange}
                  className={`pl-10 transition-[var(--transition-smooth)] ${
                    errors.phone ? 'border-destructive' : 'border-input focus:border-primary'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 transition-[var(--transition-smooth)] ${
                    errors.password ? 'border-destructive' : 'border-input focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-[var(--transition-smooth)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formValues.confirmPassword}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 transition-[var(--transition-smooth)] ${
                    errors.confirmPassword ? 'border-destructive' : 'border-input focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-[var(--transition-smooth)]"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            {/* ID Proof Upload */}
            <div className="space-y-2">
              <Label htmlFor="idProof" className="text-sm font-medium">
                ID Proof
              </Label>
              <div className="space-y-3">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-[var(--transition-smooth)] ${
                    errors.idProof ? 'border-destructive' : 'border-muted hover:border-primary'
                  }`}
                  onClick={() => document.getElementById('idProof')?.click()}
                >
                  <input
                    id="idProof"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center space-y-2">
                    {uploadedFile ? (
                      <>
                        <FileText className="h-8 w-8 text-primary" />
                        <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">Click to change</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload ID proof</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                
                {previewUrl && (
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="ID Proof Preview"
                      className="max-w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
              {errors.idProof && (
                <p className="text-sm text-destructive">{errors.idProof}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium py-2.5 transition-[var(--transition-smooth)] shadow-[var(--shadow-yellow)]"
            >
              Register as Vendor
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    <OtpModal
    isOpen={isOtpModalOpen}
    onClose={()=>setIsOtpModalOpen(false)}
    email={formValues.email}
    data={{
        name:formValues.name,
        phone:formValues.phone,
        password:formValues.password,
        idProof:uploadedImageUrl
    }}
    createAccount={verifyVendorMutation}
    resendOtp={handleResend}
    onVerifySuccess={handleOtpVerifySuccess}
    />
   
   </>
  );
};

export default VendorSignup;