"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Calendar, ChevronDown, LogIn, Menu, Ticket, User, UserCircle, X } from "lucide-react";
import { toast } from "react-toastify";
import { RootState } from "@/redux/Store";
import { removeClient } from "@/redux/slices/user/userSlice";
import { removeToken } from "@/redux/slices/user/userToken";
import { NotificationDropdown } from "@/components/notification/NotificationDropdown";
import { addNotifications, addSingleNotification, removeNotification, clearAllNotifications } from "@/redux/slices/notification/notificationSlice";
import socket from '@/hooks/socketHook';
import { useReadSingleNotification,useDeleteAllNotificationsClient } from "@/hooks/clientCustomHooks";

interface Notification {
  _id?: string;
  from: { _id: string; name: string };
  message: string;
  read: boolean;
  to: string;
  createdAt: string;
  updatedAt: string;
  senderModel: 'client' | 'vendors';
  receiverModel: 'client' | 'vendors';
  __v?: number;
  type: 'info';
}

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const client = useSelector((state: RootState) => state.clientSlice.client);
  
  const notifications = useSelector((state: RootState) => {
    const notificationState = state.notificationSlice;
    return notificationState?.notification || [];
  });
  
  const isLoggedIn = !!client;

  // Initialize mutation hooks
  const readSingleNotification = useReadSingleNotification();
  const deleteAllNotifications = useDeleteAllNotificationsClient();

  useEffect(() => {
    console.log('Navbar notifications:', notifications, 'Client:', client);
  }, [notifications, client]);

  useEffect(() => {
    if (!client) return;

    if (!socket.connected) socket.connect();

    const handleConnect = () => {
      console.log('Navbar: Socket connected');
      socket.emit('register', { userId: client._id, name: client.name }, (data: Notification[]) => {
        console.log('Navbar: Received notifications on connect:', data);
        if (Array.isArray(data) && data.length > 0) {
          // Clear existing to prevent duplicates on reconnect
          dispatch(clearAllNotifications([]));
          dispatch(addNotifications(data));
        }
      });
    };

    const handleNewNotification = (data: Notification) => {
      console.log('Navbar: New notification received:', data);
      const notification: Notification = {
        ...data,
        type: 'info',
      };
      setNewNotification(notification);
      dispatch(addSingleNotification(notification));
      setShowNotificationToast(true);
    };

    const handleDisconnect = () => {
      console.log('Navbar: Socket disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('notification', handleNewNotification);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      console.log('Navbar: Already connected, registering...');
      socket.emit('register', { userId: client._id, name: client.name }, (data: Notification[]) => {
        console.log('Navbar: Already connected, received notifications:', data);
        if (Array.isArray(data) && data.length > 0) {
          dispatch(clearAllNotifications([]));
          dispatch(addNotifications(data));
        }
      });
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('notification', handleNewNotification);
      socket.off('disconnect', handleDisconnect);
    };
  }, [client, dispatch]);

  useEffect(() => {
    if (showNotificationToast) {
      const timer = setTimeout(() => {
        setShowNotificationToast(false);
        setNewNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotificationToast]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleBookingsClick = () => {
    navigate('/bookings');
  };

  const handleWalletClick = () => {
    navigate('/wallet');
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  const handleMyTicketsClick = () => {
    navigate('/my-tickets');
  };

  const handleVendorClick = () => {
    navigate('/vendors');
  };

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleServiceClick = () => {
    navigate('/serviceBookings');
  };

  const handleMarkAsRead = (notificationId: string) => {
    console.log('Navbar: Marking notification as read:', notificationId);
    
    // Validate notificationId
    if (!notificationId || notificationId.trim() === '') {
      console.error('Invalid notification ID for marking as read');
      return;
    }

    // Emit socket event
    socket.emit('markNotificationAsRead', { notificationId });
    
    // Call API mutation
    readSingleNotification.mutate(notificationId, {
      onSuccess: (updatedNotification) => {
        console.log('Notification marked as read successfully via API');
        // Update Redux with the response from the API if available
        if (updatedNotification) {
          dispatch(addSingleNotification(updatedNotification));
        }
      },
      onError: (error) => {
        console.error('Error marking notification as read:', error);
        toast.error('Failed to mark notification as read', {
          position: "top-right",
          autoClose: 3000,
        });
      },
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    console.log('Navbar: Deleting notification:', notificationId);
    
    // Validate notificationId
    if (!notificationId || notificationId.trim() === '') {
      console.error('Invalid notification ID for deletion');
      return;
    }

    // Remove from Redux store immediately for optimistic UI update
    dispatch(removeNotification(notificationId));
    
    // Emit socket event to delete on server
    socket.emit('deleteNotification', { notificationId });
    
    // Show success toast
    toast.success('Notification deleted', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleClearAllNotifications = () => {
    if (!client?._id) {
      console.error('No client ID found');
      return;
    }

    deleteAllNotifications.mutate(client._id, {
      onSuccess: () => {
        console.log('All notifications deleted successfully');
        dispatch(clearAllNotifications([]));
        toast.success('All notifications cleared', {
          position: "top-right",
          autoClose: 2000,
        });
      },
      onError: (error) => {
        console.error('Error deleting all notifications:', error);
        toast.error('Failed to clear notifications', {
          position: "top-right",
          autoClose: 3000,
        });
      },
    });
  };

  const handleSelectNotification = (notification: Notification) => {
    console.log('Navbar: Selected notification:', notification);
    if (!notification.read && notification._id) {
      handleMarkAsRead(notification._id);
    }
    navigate('/chat', { state: { vendorId: notification.from._id, selectedChat: true } });
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
  };

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      const toastId = toast.loading("Logging out...");
      
      if (socket.connected) {
        socket.disconnect();
      }
      
      dispatch(removeClient());
      dispatch(removeToken());
      dispatch(clearAllNotifications([]));
      localStorage.removeItem('clientId');
      
      toast.update(toastId, {
        render: "Logged out successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
        closeButton: true,
      });
      
      setIsLogoutDialogOpen(false);
      setIsMenuOpen(false);
      
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error('Logout failed:', error);
      let errorMessage = "Logout failed. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsLogoutDialogOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setIsLogoutDialogOpen(false);
    toast.info("Logout cancelled", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        
        {showNotificationToast && newNotification && (
          <div className="fixed top-20 right-4 z-50">
            <NotificationDropdown
              notifications={[newNotification]}
              onMarkAsRead={handleMarkAsRead}
              onSelectNotification={handleSelectNotification}
              onViewAllNotifications={handleViewAllNotifications}
              onDeleteNotification={handleDeleteNotification}
              isToast
              onClose={() => setShowNotificationToast(false)}
            />
          </div>
        )}

        <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-yellow-600" />
            <span className="text-xl font-bold">Planzo</span>
          </div>

          <div className="hidden md:flex md:items-center md:gap-6">
            <a href="/" className="text-sm font-medium hover:text-yellow-600">
              Home
            </a>
            <a href="/events" className="text-sm font-medium hover:text-yellow-600">
              Events
            </a>
            <a href="/services" className="text-sm font-medium hover:text-yellow-600">
              Services
            </a>
            <a href="/about" className="text-sm font-medium hover:text-yellow-600">
              About
            </a>
            <a href="/contact" className="text-sm font-medium hover:text-yellow-600">
              Contact
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  <Ticket className="w-4 h-4" />
                  <span>Details</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-yellow-50 border-yellow-200">
                <DropdownMenuLabel className="text-yellow-800">Event Categories</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-yellow-200" />
                <DropdownMenuItem className="text-yellow-800 hover:bg-yellow-200" onClick={handleBookingsClick}>
                  Event Bookings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-yellow-800 hover:bg-yellow-200" onClick={handleServiceClick}>
                  Service Bookings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-yellow-800 hover:bg-yellow-200" onClick={handleWalletClick}>
                  Wallet
                </DropdownMenuItem>
                <DropdownMenuItem className="text-yellow-800 hover:bg-yellow-200" onClick={handleChatClick}>
                  Chat
                </DropdownMenuItem>
                <DropdownMenuItem className="text-yellow-800 hover:bg-yellow-200" onClick={handleVendorClick}>
                  Vendors
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-yellow-200" />
                <DropdownMenuItem className="text-yellow-800 hover:bg-yellow-200">
                  View All Events
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Show notifications only when logged in */}
            {isLoggedIn && (
              <NotificationDropdown
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onSelectNotification={handleSelectNotification}
                onViewAllNotifications={handleViewAllNotifications}
                onDeleteNotification={handleDeleteNotification}
                onClearAllNotifications={handleClearAllNotifications}
              />
            )}

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1">
                    <UserCircle className="w-5 h-5" />
                    <span>Profile</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-yellow-50 border-yellow-200">
                  <DropdownMenuLabel className="text-yellow-800">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-yellow-200" />
                  <DropdownMenuItem className="text-yellow-800 hover:bg-yellow-200" onClick={handleProfileClick}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-yellow-200" />
                  <DropdownMenuItem
                    className="text-yellow-800 hover:bg-yellow-200"
                    onClick={handleLogoutClick}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-9" onClick={handleLoginClick}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button
                  className="h-9 bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={handleSignupClick}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-0 z-40 flex flex-col w-full h-full pt-16 bg-white md:hidden">
            <div className="flex flex-col p-4 space-y-4 overflow-y-auto">
              <a href="/" className="py-2 text-lg font-medium border-b text-yellow-800">
                Home
              </a>
              <a href="/events" className="py-2 text-lg font-medium border-b text-yellow-800">
                Events
              </a>
              <a href="/services" className="py-2 text-lg font-medium border-b text-yellow-800">
                Services
              </a>
              <a href="/about" className="py-2 text-lg font-medium border-b text-yellow-800">
                About
              </a>
              <a href="/contact" className="py-2 text-lg font-medium border-b text-yellow-800">
                Contact
              </a>

              <div className="py-2 text-lg font-medium border-b text-yellow-800">
                <div className="flex items-center justify-between">
                  <span>Details</span>
                  <ChevronDown className="w-5 h-5" />
                </div>
                <div className="pl-4 mt-2 space-y-2">
                  <button
                    onClick={handleBookingsClick}
                    className="block py-1 text-left w-full text-yellow-800"
                  >
                    Event Bookings
                  </button>
                  <button
                    onClick={handleServiceClick}
                    className="block py-1 text-left w-full text-yellow-800"
                  >
                    Service Bookings
                  </button>
                  <button
                    onClick={handleWalletClick}
                    className="block py-1 text-left w-full text-yellow-800"
                  >
                    Wallet
                  </button>
                  <button
                    onClick={handleChatClick}
                    className="block py-1 text-left w-full text-yellow-800"
                  >
                    Chat
                  </button>
                  <button
                    onClick={handleVendorClick}
                    className="block py-1 text-left w-full text-yellow-800"
                  >
                    Vendors
                  </button>
                  <a href="#" className="block py-1 text-yellow-800">
                    View All Events
                  </a>
                </div>
              </div>

              {/* Show notifications in mobile menu only when logged in */}
              {isLoggedIn && (
                <div className="py-2 text-lg font-medium border-b text-yellow-800">
                  <div className="flex items-center justify-between">
                    <span>Notifications ({notifications.length})</span>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                  <div className="pl-4 mt-2 space-y-2">
                    <NotificationDropdown
                      notifications={notifications}
                      onMarkAsRead={handleMarkAsRead}
                      onSelectNotification={handleSelectNotification}
                      onViewAllNotifications={handleViewAllNotifications}
                      onDeleteNotification={handleDeleteNotification}
                      onClearAllNotifications={handleClearAllNotifications}
                    />
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAllNotifications}
                        disabled={deleteAllNotifications.isPending}
                        className="block py-1 text-left w-full text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deleteAllNotifications.isPending ? 'Clearing...' : 'Clear All Notifications'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isLoggedIn ? (
                <div className="py-2 text-lg font-medium border-b text-yellow-800">
                  <div className="flex items-center justify-between">
                    <span>My Account</span>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                  <div className="pl-4 mt-2 space-y-2">
                    <button
                      onClick={handleProfileClick}
                      className="block py-1 text-left w-full text-yellow-800"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleMyTicketsClick}
                      className="block py-1 text-left w-full text-yellow-800"
                    >
                      My Tickets
                    </button>
                    <button
                      onClick={handleLogoutClick}
                      className="block py-1 text-left text-yellow-800"
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-4">
                  <Button variant="outline" className="w-full" onClick={handleLoginClick}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={handleSignupClick}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogoutCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              disabled={isLoggingOut}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Navbar;