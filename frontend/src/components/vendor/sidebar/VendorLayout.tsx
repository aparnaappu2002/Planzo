import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { VendorSidebar } from "./VendorSidebar"

export function VendorLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-vendor-background/30">
        <VendorSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header with trigger */}
          <header className="h-14 border-b border-vendor-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center h-full px-4 gap-2">
              <SidebarTrigger className="text-vendor-accent hover:bg-vendor-background" />
              <div className="flex-1" />
             
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}