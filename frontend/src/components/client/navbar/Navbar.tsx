"use client"

import React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Calendar, ChevronDown, LogIn, Menu, Ticket, User, UserCircle, X } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "react-toastify"

import { RootState } from "@/redux/Store"
import { removeClient } from "@/redux/slices/user/userSlice"
import { removeToken } from "@/redux/slices/user/userToken"

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const client = useSelector((state: RootState) => state.clientSlice.client)
  const isLoggedIn = !!client

  const handleLoginClick = () => {
    navigate('/login') 
  }

  const handleSignupClick = () => {
    navigate('/signup') 
  }
  
  const handleProfileClick = () => {
    navigate('/profile')
  }

  // Add navigation handlers for dropdown items
  const handleBookingsClick = () => {
    navigate('/bookings')
  }

  const handleWalletClick = () => {
    navigate('/wallet')
  }

  const handleChatClick = () => {
    navigate('/chat')
  }

  const handleMyTicketsClick = () => {
    navigate('/my-tickets') // or whatever your tickets route is
  }
  const handleVendorClick = () => {
    navigate('/vendors') 
  }

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true)
  }

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true)
      
      
      const toastId = toast.loading("Logging out...")
      
      
      dispatch(removeClient())
      dispatch(removeToken())
      
      
      localStorage.removeItem('clientId')
     
      
      
      toast.update(toastId, {
        render: "Logged out successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
        closeButton: true
      })
      
      setIsLogoutDialogOpen(false)
      setIsMenuOpen(false) 
      
      
      setTimeout(() => {
        navigate('/login')
      }, 1000)
      
    } catch (error) {
      console.error('Logout failed:', error)
      
      
      let errorMessage = "Logout failed. Please try again."
      
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      
      setIsLogoutDialogOpen(false)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleLogoutCancel = () => {
    setIsLogoutDialogOpen(false)
    toast.info("Logout cancelled", {
      position: "top-right",
      autoClose: 2000,
    })
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Planzo</span>
          </div>

          
          <div className="hidden md:flex md:items-center md:gap-6">
            <a href="/" className="text-sm font-medium hover:text-primary">
              Home
            </a>
            <a href="/events" className="text-sm font-medium hover:text-primary">
              Events
            </a>
            <a href="/services" className="text-sm font-medium hover:text-primary">
              Services
            </a>
            <a href="/about" className="text-sm font-medium hover:text-primary">
              About
            </a>
            <a href="/contact" className="text-sm font-medium hover:text-primary">
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Event Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBookingsClick}>Bookings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleWalletClick}>Wallet</DropdownMenuItem>
                <DropdownMenuItem onClick={handleChatClick}>Chat</DropdownMenuItem>
                <DropdownMenuItem onClick={handleVendorClick}>Vendors</DropdownMenuItem>
                <DropdownMenuItem>Theater</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View All Events</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1">
                    <UserCircle className="w-5 h-5" />
                    <span>Profile</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMyTicketsClick}>
                    <Ticket className="w-4 h-4 mr-2" />
                    My Tickets
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogoutClick} disabled={isLoggingOut}>
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
                <Button className="h-9 bg-primary hover:bg-primary/90" onClick={handleSignupClick}>Sign Up</Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 flex flex-col w-full h-full pt-16 bg-white md:hidden">
            <div className="flex flex-col p-4 space-y-4 overflow-y-auto">
              <a href="/" className="py-2 text-lg font-medium border-b">
                Home
              </a>
              <a href="/events" className="py-2 text-lg font-medium border-b">
                Events
              </a>
              <a href="/about" className="py-2 text-lg font-medium border-b">
                About
              </a>
              <a href="/contact" className="py-2 text-lg font-medium border-b">
                Contact
              </a>

              <div className="py-2 text-lg font-medium border-b">
                <div className="flex items-center justify-between">
                  <span>Details</span>
                  <ChevronDown className="w-5 h-5" />
                </div>
                <div className="pl-4 mt-2 space-y-2">
                  <button onClick={handleBookingsClick} className="block py-1 text-left w-full">
                    Bookings
                  </button>
                  <button onClick={handleWalletClick} className="block py-1 text-left w-full">
                    Wallet
                  </button>
                  <button onClick={handleChatClick} className="block py-1 text-left w-full">
                    Chat
                  </button>
                  <a onClick={handleVendorClick} className="block py-1">
                    Vendors
                  </a>
                  <a href="#" className="block py-1">
                    Theater
                  </a>
                </div>
              </div>

              {isLoggedIn ? (
                <div className="py-2 text-lg font-medium border-b">
                  <div className="flex items-center justify-between">
                    <span>My Account</span>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                  <div className="pl-4 mt-2 space-y-2">
                    <button onClick={handleProfileClick} className="block py-1 text-left w-full">
                      Profile
                    </button>
                    <button onClick={handleMyTicketsClick} className="block py-1 text-left w-full">
                      My Tickets
                    </button>
                    <button 
                      onClick={handleLogoutClick} 
                      className="block py-1 text-left"
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
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSignupClick}>Sign Up</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogoutCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmLogout}
              disabled={isLoggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default Navbar