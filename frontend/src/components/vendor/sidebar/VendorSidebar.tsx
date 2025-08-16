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
  Star
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

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

const vendorItems = [
  { title: "Profile", url: "/vendor/profile", icon: BarChart3 },
  { title: "Create Event", url: "/vendor/createEvent", icon: Package },
  { title: "Event Management", url: "/vendor/events", icon: ShoppingCart },
   { title: "Wallet", url: "/vendor/wallet", icon: Store },
  // { title: "Analytics", url: "/vendor/analytics", icon: TrendingUp },
  // { title: "Reviews", url: "/vendor/reviews", icon: Star },
  // { title: "Messages", url: "/vendor/messages", icon: MessageSquare },
  // { title: "Settings", url: "/vendor/settings", icon: Settings },
]

export function VendorSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const currentPath = location.pathname

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

  return (
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}