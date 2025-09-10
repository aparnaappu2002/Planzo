import { useState } from "react"
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
  LogOut
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"

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
import { useVendorLogout } from "@/hooks/vendorCustomHooks"
import { removeVendor } from "@/redux/slices/vendor/vendorSlice"
import { removeVendorToken } from "@/redux/slices/vendor/vendorTokenSlice"
import { useDispatch } from "react-redux"

const vendorItems = [
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
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const logoutMutation = useVendorLogout()
  const dispatch=useDispatch()

  const isActive = (path: string) => {
    if (path === "/vendor") {
      return currentPath === "/vendor"
    }
    return currentPath.startsWith(path)
  }

  const isExpanded = vendorItems.some((i) => isActive(i.url))

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-vendor-accent text-vendor-accent-foreground font-medium shadow-sm border border-vendor-border" 
      : "hover:bg-vendor-background/70 hover:text-vendor-accent-foreground transition-colors"

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      
      localStorage.removeItem('vendorId')
      dispatch(removeVendor())
      dispatch(removeVendorToken())
      
      
      // Navigate to login page
      navigate('/vendor/login', { replace: true })
      setShowLogoutModal(false)
    } catch (error) {
      console.error('Logout failed:', error)
      // Handle logout error (show toast, etc.)
      setShowLogoutModal(false)
    }
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  return (
    <>
      <Sidebar
        className={`${collapsed ? "w-14" : "w-64"} bg-vendor-background border-vendor-border`}
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