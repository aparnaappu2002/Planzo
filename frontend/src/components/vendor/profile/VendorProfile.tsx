import { useState, useEffect } from "react";
import { Camera, Phone, User, Lock, Save, Upload, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'react-toastify';
import { useUpdateVendorDetailsMutation, useVendorChangePassword, useUploadImageMutation } from "@/hooks/vendorCustomHooks";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Store";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addVendor } from "@/redux/slices/vendor/vendorSlice";

const VendorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const vendor = useSelector((state: RootState) => state.vendorSlice.vendor);
 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
 
  const { mutate: uploadImage, isLoading: isUploadingImage } = useUploadImageMutation();
  const { mutate: changePassword, isLoading: isChangingPass } = useVendorChangePassword();
  const { mutate: updateDetails, isLoading: isUpdating } = useUpdateVendorDetailsMutation();

  const [profileData, setProfileData] = useState({
    name: vendor?.name || '',
    phone: vendor?.phone || '',
    about: vendor?.about || '',
    idProof:vendor.idProof
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

 
  useEffect(() => {
    if (!vendor) {
      navigate('/vendor/login');
      return;
    }

    if (vendor.vendorStatus !== 'approved') {
      navigate('/vendor/dashboard');
      return;
    }

    
    setProfileData({
      name: vendor.name || '',
      phone: vendor.phone || '',
      about: vendor.about || '',
      
    });

    setLoading(false);
  }, [vendor, navigate]);

  const validatePassword = (field: string, value: string) => {
    let error = '';
    
    if (field === 'newPassword') {
      if (value.length < 6) {
        error = 'Password must be at least 6 characters';
      } else if (!/[A-Z]/.test(value)) {
        error = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(value)) {
        error = 'Password must contain at least one lowercase letter';
      } else if (!/[0-9]/.test(value)) {
        error = 'Password must contain at least one number';
      } else if (!/[^A-Za-z0-9]/.test(value)) {
        error = 'Password must contain at least one special character';
      }
    } else if (field === 'confirmPassword' && value !== passwordData.newPassword) {
      error = 'Passwords do not match';
    }
    
    setPasswordErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return error === '';
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'newPassword' || field === 'confirmPassword') {
      validatePassword(field, value);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "Planzo");
      
      uploadImage(formData, {
        onSuccess: (response) => {
            const updatedClient = {
              ...vendor,
              profileImage: response.url
            };
            dispatch(addVendor(updatedClient));
            toast.success('Profile image updated successfully!');
        },
        onError: (error) => {
          toast.error('Failed to upload image. Please try again.');
          console.error('Image upload error:', error);
        }
      });
    }
  };

  const handleSaveProfile = () => {
    const updateData = {
      id: vendor._id,
      ...profileData
    };

    updateDetails(updateData, {
      onSuccess: (response) => {
        setIsEditing(false);
        dispatch(addVendor(response.updatedVendor))
        toast.success('Profile updated successfully!');
      },
      onError: (error) => {
        toast.error('Failed to update profile. Please try again.');
        console.error('Profile update error:', error);
      }
    });
  };

  const handleChangePassword = () => {
   
    const isNewPasswordValid = validatePassword('newPassword', passwordData.newPassword);
    const isConfirmPasswordValid = validatePassword('confirmPassword', passwordData.confirmPassword);
    
    if (!passwordData.oldPassword) {
      setPasswordErrors(prev => ({
        ...prev,
        oldPassword: 'Current password is required'
      }));
      return;
    }

    if (!isNewPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match.");
      return;
    }
    
    const passwordChangeData = {
      userId: vendor._id,
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword
    };

    changePassword(passwordChangeData, {
      onSuccess: () => {
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
        toast.success('Password changed successfully!');
      },
      onError: (error) => {
        let errorMessage 
            
            if (error?.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error?.message) {
              errorMessage = error.message;
            } else if (typeof error === 'string') {
              errorMessage = error;
            }
            
            toast.error(errorMessage);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent mb-2">
            Vendor Profile Verified
          </h1>
          <p className="text-muted-foreground">Manage your vendor account and settings</p>
        </div>

        {/* Status Alert for non-approved vendors */}
        {vendor.vendorStatus === 'pending' && (
          <Alert className="border-warning/50 bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning-foreground">
              Your vendor account is pending approval. Some features may be limited.
            </AlertDescription>
          </Alert>
        )}

        {vendor.vendorStatus === 'rejected' && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive-foreground">
              Your vendor account has been rejected. Please contact support for more information.
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Information Card */}
        <Card className="shadow-yellow border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-warning/5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <h2>Verified Vendor</h2>
              <Button
                variant={isEditing ? "secondary" : "default"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-primary hover:bg-primary/90"
                disabled={isUpdating}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile Image */}
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-primary/20">
                      <AvatarImage src={vendor?.profileImage} alt={vendor.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {vendor.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className={`absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 cursor-pointer shadow-lg transition-colors ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isUploadingImage ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {isUploadingImage ? 'Uploading...' : 'Click camera icon to update photo'}
                  </p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={vendor.email}
                    disabled
                    className="mt-1 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="about">About</Label>
                  <Textarea
                    id="about"
                    value={profileData.about}
                    onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1 min-h-[100px]"
                    placeholder="Tell customers about your business..."
                  />
                </div>

                {isEditing && (
                  <Button 
                    onClick={handleSaveProfile}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isUpdating}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card className="shadow-yellow border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-warning/5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
              <Button
                variant={isChangingPassword ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="border-primary/20 hover:bg-primary/5"
                disabled={isChangingPass}
              >
                {isChangingPassword ? "Cancel" : "Change Password"}
              </Button>
            </div>
          </CardHeader>
          {isChangingPassword && (
            <CardContent className="p-6">
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      type={showOldPassword ? "text" : "password"}
                      value={passwordData.oldPassword}
                      onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.oldPassword && (
                    <p className="text-xs text-destructive mt-1">{passwordErrors.oldPassword}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-destructive mt-1">{passwordErrors.newPassword}</p>
                  )}
                  {!passwordErrors.newPassword && passwordData.newPassword && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Password must contain:
                      <ul className="list-disc pl-5">
                        <li className={passwordData.newPassword.length >= 6 ? 'text-green-500' : ''}>
                          At least 6 characters
                        </li>
                        <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-500' : ''}>
                          One uppercase letter
                        </li>
                        <li className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-500' : ''}>
                          One lowercase letter
                        </li>
                        <li className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-500' : ''}>
                          One number
                        </li>
                        <li className={/[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'text-green-500' : ''}>
                          One special character
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <Button 
                  onClick={handleChangePassword}
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={
                    !passwordData.oldPassword || 
                    !passwordData.newPassword || 
                    !passwordData.confirmPassword || 
                    isChangingPass ||
                    !!passwordErrors.newPassword ||
                    !!passwordErrors.confirmPassword
                  }
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isChangingPass ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VendorProfile;