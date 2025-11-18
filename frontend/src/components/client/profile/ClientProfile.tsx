import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-toastify';
import { Edit, Camera, Lock, User, Phone, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useUpdateClientProfie } from '@/hooks/clientCustomHooks';
import { useUploadImageMutation } from '@/hooks/vendorCustomHooks';
import { useChangePasswordClient } from '@/hooks/clientCustomHooks';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/Store';
import { addClient } from '@/redux/slices/user/userSlice';

interface User {
  id: string;
  name: string;
  email: string;
  phone: number;
  profileImage?: string;
  role: string;
  onlineStatus: 'online' | 'offline';
  status?: string;
}

interface UpdateProfileData {
  name: string;
  phone: number;
  profileImage?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const profilePlaceholder = '/default-avatar.png';

const ClientProfile: React.FC = () => {
  const dispatch = useDispatch();
  const client = useSelector((state: RootState) => state.clientSlice.client);
 
  
  // Early return if client is not loaded yet
  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }
 
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    name: client.name || '',
    phone: client.phone || 0,
    profileImage: client.profileImage || '',
  });
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation errors
  const [profileErrors, setProfileErrors] = useState<ValidationErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<ValidationErrors>({});

  // Update profile data when client state changes
  useEffect(() => {
    if (client) {
      setProfileData({
        name: client.name || '',
        phone: client.phone || 0,
        profileImage: client.profileImage || '',
      });
    }
  }, [client]);

  // Using the custom hooks
  const updateProfileMutation = useUpdateClientProfie();
  const uploadImageMutation = useUploadImageMutation();
  const changePasswordMutation = useChangePasswordClient();

  // Validation functions
  const validateProfileData = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    } else if (profileData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(profileData.name.trim())) {
      errors.name = 'Name should only contain letters and spaces';
    }

    if (!profileData.phone || profileData.phone <= 0) {
      errors.phone = 'Valid phone number is required';
    } else if (!/^\d{10}$/.test(profileData.phone.toString())) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordData = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Error handling function
  const handleError = (error: any, fallbackMessage: string) => {
    let errorMessage = fallbackMessage;
    
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    toast.error(errorMessage);
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "Planzo");
        
        const uploadResult = await uploadImageMutation.mutateAsync(formData);
        const imageUrl = uploadResult.secure_url;
        
        setImagePreview(imageUrl);
        setProfileData(prev => ({ ...prev, profileImage: imageUrl }));
        
        toast.success('Profile image uploaded successfully');
      } catch (error) {
        handleError(error, 'Failed to upload image. Please try again.');
      }
    }
  };

  const handleProfileUpdate = async () => {
    if (!validateProfileData()) {
      return;
    }

    try {
      const clientUpdateData = {
        _id: client._id,
        name: profileData.name.trim(),
        phone: profileData.phone,
        profileImage: profileData.profileImage,
      };

      const updatedClient = await updateProfileMutation.mutateAsync(clientUpdateData);
      
      dispatch(addClient(updatedClient.updatedProfile));
      
      // Close dialog and reset preview
      setIsEditingProfile(false);
      setImagePreview(null);
      setProfileErrors({});
      
      toast.success(updatedClient.message || 'Profile updated successfully');
    } catch (error) {
      handleError(error, 'Error while updating the profile');
    }
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordData()) {
      return;
    }

    try {
      const response = await changePasswordMutation.mutateAsync({
        userId: client._id || '',
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
      
      toast.success(response.message || 'Password changed successfully');
    } catch (error) {
      handleError(error, 'Error while changing password');
    }
  };

  const resetProfileForm = () => {
    setIsEditingProfile(false);
    setImagePreview(null);
    setProfileErrors({});
    setProfileData({
      name: client?.name || '',
      phone: client?.phone || 0,
      profileImage: client?.profileImage || '',
    });
  };

  const resetPasswordForm = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="bg-gradient-card border-primary/10 shadow-warm">
          <CardHeader className="text-center space-y-4">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-glow">
                <AvatarImage 
                  src={imagePreview || client.profileImage || profilePlaceholder} 
                  alt="Profile"
                />
                <AvatarFallback className="bg-secondary text-2xl">
                  {client?.name}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <div className={`w-6 h-6 rounded-full border-2 border-background ${
                  client?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{client?.name || 'Unknown User'}</h2>
              
              <p className="text-muted-foreground capitalize">{client?.role || 'User'}</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{client?.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="font-medium">{client?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{client?.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <p className="font-medium capitalize text-green-600">{client?.status || 'active'}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                <DialogTrigger asChild>
                  <Button variant="warm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Profile Image Upload */}
                    <div className="text-center space-y-2">
                      <Avatar className="w-20 h-20 mx-auto border-2 border-primary/20">
                        <AvatarImage 
                          src={imagePreview || client.profileImage || profilePlaceholder} 
                          alt="Profile"
                        />
                        <AvatarFallback className="bg-secondary">
                          {client?.name}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          type="file"
                          id="profile-image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={uploadImageMutation.isPending}
                        />
                        <Label
                          htmlFor="profile-image"
                          className="inline-flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                          {uploadImageMutation.isPending ? 'Uploading...' : 'Change Photo'}
                        </Label>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => {
                          setProfileData(prev => ({ ...prev, name: e.target.value }));
                          if (profileErrors.name) {
                            setProfileErrors(prev => ({ ...prev, name: undefined }));
                          }
                        }}
                        placeholder="Enter your full name"
                        className={profileErrors.name ? 'border-red-500' : ''}
                      />
                      {profileData.name.length>15 ? (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>Name cannot exceed 15 characters</span>
                        </div>
                      ):
                      profileErrors.name && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{profileErrors.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone || ''}
                        onChange={(e) => {
                          const phoneValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
                          setProfileData(prev => ({ 
                            ...prev, 
                            phone: phoneValue ? Number(phoneValue) : 0 
                          }));
                          if (profileErrors.phone) {
                            setProfileErrors(prev => ({ ...prev, phone: undefined }));
                          }
                        }}
                        placeholder="Enter your phone number"
                        maxLength={10}
                        className={profileErrors.phone ? 'border-red-500' : ''}
                      />
                      {profileErrors.phone && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{profileErrors.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={resetProfileForm}
                        className="flex-1"
                        disabled={updateProfileMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="default" 
                        onClick={handleProfileUpdate} 
                        className="flex-1"
                        disabled={updateProfileMutation.isPending || uploadImageMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => {
                            setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }));
                            if (passwordErrors.currentPassword) {
                              setPasswordErrors(prev => ({ ...prev, currentPassword: undefined }));
                            }
                          }}
                          placeholder="Enter your current password"
                          className={passwordErrors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{passwordErrors.currentPassword}</span>
                        </div>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => {
                            setPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                            if (passwordErrors.newPassword) {
                              setPasswordErrors(prev => ({ ...prev, newPassword: undefined }));
                            }
                          }}
                          placeholder="Enter your new password"
                          className={passwordErrors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{passwordErrors.newPassword}</span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => {
                            setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                            if (passwordErrors.confirmPassword) {
                              setPasswordErrors(prev => ({ ...prev, confirmPassword: undefined }));
                            }
                          }}
                          placeholder="Confirm your new password"
                          className={passwordErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{passwordErrors.confirmPassword}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={resetPasswordForm}
                        className="flex-1"
                        disabled={changePasswordMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="default" 
                        onClick={handlePasswordChange} 
                        className="flex-1"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientProfile;