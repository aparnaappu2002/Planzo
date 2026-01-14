import { useState, useEffect } from "react"
import { 
  Store, 
  Package, 
  BarChart3, 
  Users, 
  Settings, 
  ShoppingCart,
  TrendingUp,
  MessageSquare,
  Star,
  LogOut,
  Bell
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "react-toastify"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { NotificationDropdown } from "@/components/notification/NotificationDropdown"
import { useVendorLogout } from "@/hooks/vendorCustomHooks"
import { useDeleteAllNotificationsVendor } from "@/hooks/vendorCustomHooks"
import { useReadSingleNotification } from "@/hooks/clientCustomHooks"
import { removeVendor } from "@/redux/slices/vendor/vendorSlice"
import { removeVendorToken } from "@/redux/slices/vendor/vendorTokenSlice"
import { 
  addNotifications, 
  addSingleNotification, 
  removeNotification, 
  clearAllNotifications 
} from "@/redux/slices/notification/notificationSlice"
import socket from '@/hooks/socketHook'
import { RootState } from "@/redux/Store"

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

const vendorItems = [
  { title: "Dashboard", url: "/vendor/dashboard", icon: BarChart3 },
  { title: "Profile", url: "/vendor/profile", icon: BarChart3 },
  { title: "Create Event", url: "/vendor/createEvent", icon: Package },
  { title: "Event Management", url: "/vendor/events", icon: ShoppingCart },
  { title: "Wallet", url: "/vendor/wallet", icon: Store },
  { title: "Tickets", url: "/vendor/tickets", icon: TrendingUp },
  { title: "Work Samples", url: "/vendor/workSamples", icon: MessageSquare },
  { title: "Services", url: "/vendor/services", icon: Settings },
  { title: "Bookings", url: "/vendor/bookings", icon: Settings },
]

export function VendorSidebar() {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [newNotification, setNewNotification] = useState<Notification | null>(null)
  const [showNotificationToast, setShowNotificationToast] = useState(false)
  
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const currentPath = location.pathname
  const logoutMutation = useVendorLogout()
  
  // Get vendor and notifications from Redux
  const vendor = useSelector((state: RootState) => state.vendorSlice.vendor)
  const notifications = useSelector((state: RootState) => {
    const notificationState = state.notificationSlice;
    return notificationState?.notification || [];
  })
  
  // Initialize mutation hooks
  const readSingleNotification = useReadSingleNotification()
  const deleteAllNotifications = useDeleteAllNotificationsVendor()

  const isActive = (path: string) => {
    if (path === "/vendor") {
      return currentPath === "/vendor"
    }
    return currentPath.startsWith(path)
  }

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-vendor-accent text-vendor-accent-foreground font-medium shadow-sm border border-vendor-border" 
      : "hover:bg-vendor-background/70 hover:text-vendor-accent-foreground transition-colors"

  // Socket connection and notification handling
  useEffect(() => {
    if (!vendor) return

    if (!socket.connected) socket.connect()

    const handleConnect = () => {
      console.log('VendorSidebar: Socket connected')
      socket.emit('register', { userId: vendor._id, name: vendor.name }, (data: Notification[]) => {
        console.log('VendorSidebar: Received notifications on connect:', data)
        if (Array.isArray(data) && data.length > 0) {
          // Clear existing to prevent duplicates on reconnect
          dispatch(clearAllNotifications([]))
          dispatch(addNotifications(data))
        }
      })
    }

    const handleNewNotification = (data: Notification) => {
      console.log('VendorSidebar: New notification received:', data)
      const notification: Notification = {
        ...data,
        type: 'info',
      }
      setNewNotification(notification)
      dispatch(addSingleNotification(notification))
      setShowNotificationToast(true)
      
      // Show toast notification
      
    }

    const handleDisconnect = () => {
      console.log('VendorSidebar: Socket disconnected')
    }

    socket.on('connect', handleConnect)
    socket.on('notification', handleNewNotification)
    socket.on('disconnect', handleDisconnect)

    if (socket.connected) {
      console.log('VendorSidebar: Already connected, registering...')
      socket.emit('register', { userId: vendor._id, name: vendor.name }, (data: Notification[]) => {
        console.log('VendorSidebar: Already connected, received notifications:', data)
        if (Array.isArray(data) && data.length > 0) {
          dispatch(clearAllNotifications([]))
          dispatch(addNotifications(data))
        }
      })
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('notification', handleNewNotification)
      socket.off('disconnect', handleDisconnect)
    }
  }, [vendor, dispatch])

  // Auto-hide notification toast
  useEffect(() => {
    if (showNotificationToast) {
      const timer = setTimeout(() => {
        setShowNotificationToast(false)
        setNewNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showNotificationToast])

  const handleMarkAsRead = (notificationId: string) => {
    console.log('VendorSidebar: Marking notification as read:', notificationId)
    
    if (!notificationId || notificationId.trim() === '') {
      console.error('Invalid notification ID for marking as read')
      return
    }

    // Emit socket event
    socket.emit('markNotificationAsRead', { notificationId })
    
    // Call API mutation
    readSingleNotification.mutate(notificationId, {
      onSuccess: (updatedNotification) => {
        console.log('Notification marked as read successfully via API')
        if (updatedNotification) {
          dispatch(addSingleNotification(updatedNotification))
        }
      },
      onError: (error) => {
        console.error('Error marking notification as read:', error)
        toast.error('Failed to mark notification as read', {
          position: "top-right",
          autoClose: 3000,
        })
      },
    })
  }

  const handleDeleteNotification = (notificationId: string) => {
    console.log('VendorSidebar: Deleting notification:', notificationId)
    
    if (!notificationId || notificationId.trim() === '') {
      console.error('Invalid notification ID for deletion')
      return
    }

    // Remove from Redux store immediately for optimistic UI update
    dispatch(removeNotification(notificationId))
    
    // Emit socket event to delete on server
    socket.emit('deleteNotification', { notificationId })
    
    toast.success('Notification deleted', {
      position: "top-right",
      autoClose: 2000,
    })
  }

  const handleClearAllNotifications = () => {
    if (!vendor?._id) {
      console.error('No vendor ID found')
      return
    }

    deleteAllNotifications.mutate(vendor._id, {
      onSuccess: () => {
        console.log('All notifications deleted successfully')
        dispatch(clearAllNotifications([]))
        toast.success('All notifications cleared', {
          position: "top-right",
          autoClose: 2000,
        })
      },
      onError: (error) => {
        console.error('Error deleting all notifications:', error)
        toast.error('Failed to clear notifications', {
          position: "top-right",
          autoClose: 3000,
        })
      },
    })
  }

  const handleSelectNotification = (notification: Notification) => {
    console.log('VendorSidebar: Selected notification:', notification)
    if (!notification.read && notification._id) {
      handleMarkAsRead(notification._id)
    }
    // Navigate to chat or relevant page
    navigate('/vendor/chat', { state: { clientId: notification.from._id, selectedChat: true } })
  }

  const handleViewAllNotifications = () => {
    navigate('/vendor/notifications')
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      
      // Disconnect socket
      if (socket.connected) {
        socket.disconnect()
      }
      
      localStorage.removeItem('vendorId')
      dispatch(removeVendor())
      dispatch(removeVendorToken())
      dispatch(clearAllNotifications([]))
      
      toast.success('Logged out successfully', {
        position: "top-right",
        autoClose: 2000,
      })
      
      // Navigate to login page
      navigate('/vendor/login', { replace: true })
      setShowLogoutModal(false)
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout failed. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      })
      setShowLogoutModal(false)
    }
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      {/* Notification Toast */}
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

      <Sidebar
        className={`${collapsed ? "w-14" : "w-64"} bg-vendor-background border-vendor-border}`}
        collapsible="icon"
      >
        <SidebarContent className="bg-vendor-background">
          {/* Vendor Header */}
          <div className="p-4 border-b border-vendor-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-primary-foreground" />
              </div>
              {!collapsed && (
                <div>
                  <h2 className="font-semibold text-vendor-accent-foreground">Vendor Portal</h2>
                  <p className="text-xs text-muted-foreground">Manage your store</p>
                </div>
              )}
            </div>
          </div>

          <SidebarGroup className="p-2">
            <SidebarGroupLabel className="text-vendor-accent-foreground/70">
              Notifications
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {vendor && (
                  <SidebarMenuItem>
                    <div className="h-10 px-2">
                      {collapsed ? (
                        <button
                          className="relative flex items-center justify-center w-full h-full rounded-md hover:bg-vendor-background/70 transition-colors"
                          onClick={handleViewAllNotifications}
                          title={`Notifications (${unreadCount} unread)`}
                        >
                          <Bell className="w-4 h-4" />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </button>
                      ) : (
                        <NotificationDropdown
                          notifications={notifications}
                          onMarkAsRead={handleMarkAsRead}
                          onSelectNotification={handleSelectNotification}
                          onViewAllNotifications={handleViewAllNotifications}
                          onDeleteNotification={handleDeleteNotification}
                          onClearAllNotifications={handleClearAllNotifications}
                        />
                      )}
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="p-2">
            <SidebarGroupLabel className="text-vendor-accent-foreground/70">
              Store Management
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {vendorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-10">
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/vendor"}
                        className={getNavCls}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="p-2">
            <SidebarGroupLabel className="text-vendor-accent-foreground/70">
              Account
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {/* Logout Button */}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className="h-10 hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={handleLogoutClick}
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">Logout</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Logout Confirmation Modal */}
      <AlertDialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to access your vendor portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogoutCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}