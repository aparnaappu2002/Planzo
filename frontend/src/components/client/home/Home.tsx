import type React from "react"
import { Navbar } from "../navbar/Navbar"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarDays, ChevronRight, MapPin, Search, Star, Ticket, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"

// Sample event data
const featuredEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    date: "Aug 15-17, 2023",
    location: "Golden Park, San Francisco",
    image: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1745200251/ahaaxpgqxsyqdmzaf2fm.jpg",
    category: "Music",
    price: "₹99",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Tech Conference 2023",
    date: "Sep 5-7, 2023",
    location: "Convention Center, New York",
    image: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1745200888/people-taking-part-high-protocol-event_23-2150951243_gac7qa.jpg",
    category: "Conference",
    price: "₹149",
    rating: 4.6,
  },
  {
    id: 3,
    title: "Food & Wine Expo",
    date: "Oct 12-14, 2023",
    location: "Grand Hall, Chicago",
    image: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1745200974/media_14694f6b1bb332eec7aaa4cfb6c0fd12397756fb9_lvyion.png",
    category: "Food",
    price: "₹75",
    rating: 4.7,
  },
  {
    id: 4,
    title: "International Film Festival",
    date: "Nov 1-10, 2023",
    location: "Cinema Plaza, Los Angeles",
    image: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1745201423/chicago-film-festival-1800x900_hvil0o.jpg",
    category: "Arts",
    price: "₹120",
    rating: 4.9,
  },
]

// Sample testimonials
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Event Organizer",
    content:
      "EventGold has transformed how we manage our events. The platform is intuitive and the customer support is exceptional.",
    avatar: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1745201660/7e715ed9-44d4-4827-8c13-b62f5f8e0a2-1532619353372-8604_xh3qfy.png",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Regular Attendee",
    content:
      "I've been using EventGold to discover and book events for over a year now. The experience is seamless and I love the recommendations!",
    avatar: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1745201776/1738861390380_oeco8r.jpg",
  },
  {
    id: 3,
    name: "Jessica Williams",
    role: "Corporate Event Manager",
    content:
      "The analytics and reporting features have been invaluable for our corporate events. Highly recommend for any serious event professional.",
    avatar: "https://res.cloudinary.com/dzpf5joxo/image/upload/v1745201866/4663_tcpqmw.webp",
  },
]

export const HomePage: React.FC = () => {
  const navigate=useNavigate()
const handleSignupClick = () => {
  navigate('/signup') 
}
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-yellow-100 to-white">
        <div className="absolute inset-0 opacity-10 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center"></div>
        <div className="w-full relative px-4 mx-auto md:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 md:gap-10">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800">
                  Discover Amazing Events
                </Badge>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Find and Book <span className="text-yellow-600">Unforgettable</span> Experiences
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Discover, book, and manage events with ease. From concerts to conferences, find your next experience
                  with EventGold.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button className="h-12 text-base bg-yellow-500 hover:bg-yellow-600"
                onClick={()=>navigate('/events')}>
                  Explore Events
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" className="h-12 text-base">
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="w-full px-4 mx-auto md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 mb-10 md:flex-row">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Events</h2>
              <p className="text-gray-500">Discover the most popular events happening soon</p>
            </div>
            <Button variant="outline" className="gap-1">
              View All Events
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                  />
                  <Badge className="absolute top-2 right-2 bg-yellow-500">{event.category}</Badge>
                </div>
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-gray-500">
                    <CalendarDays className="w-4 h-4" />
                    {event.date}
                  </CardDescription>
                  <CardDescription className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{event.rating}</span>
                    </div>
                    <span className="font-bold text-yellow-600">{event.price}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                    <Ticket className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full opacity-50 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-200 rounded-full opacity-40 -ml-24 -mb-24"></div>
        <div className="w-full px-4 mx-auto text-center md:px-6 lg:px-8">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="max-w-2xl mx-auto mb-12 text-gray-500">
            EventGold makes it easy to discover, book, and manage events in just a few simple steps
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative flex flex-col items-center p-6 border rounded-lg">
              <div className="flex items-center justify-center w-16 h-16 mb-4 text-white rounded-full bg-yellow-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Discover Events</h3>
              <p className="text-gray-500">
                Browse through thousands of events or use our smart search to find exactly what you're looking for.
              </p>
              <div className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 -mt-4 -mr-4 text-white rounded-full bg-yellow-500">
                1
              </div>
            </div>

            <div className="relative flex flex-col items-center p-6 border rounded-lg">
              <div className="flex items-center justify-center w-16 h-16 mb-4 text-white rounded-full bg-yellow-500">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Book Tickets</h3>
              <p className="text-gray-500">
                Secure your spot with our easy booking system. Choose your seats and pay securely online.
              </p>
              <div className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 -mt-4 -mr-4 text-white rounded-full bg-yellow-500">
                2
              </div>
            </div>

            <div className="relative flex flex-col items-center p-6 border rounded-lg">
              <div className="flex items-center justify-center w-16 h-16 mb-4 text-white rounded-full bg-yellow-500">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Enjoy the Experience</h3>
              <p className="text-gray-500">
                Attend the event with digital tickets and share your experience with friends and family.
              </p>
              <div className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 -mt-4 -mr-4 text-white rounded-full bg-yellow-500">
                3
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="w-full px-4 mx-auto md:px-6 lg:px-8">
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-center">What Our Users Say</h2>
          <p className="max-w-2xl mx-auto mb-12 text-center text-gray-500">
            Join thousands of satisfied users who have discovered amazing events with EventGold
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="object-cover w-12 h-12 rounded-full"
                  />
                  <div>
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <CardDescription>{testimonial.role}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">"{testimonial.content}"</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-yellow-50">
        <div className="w-full px-4 mx-auto text-center md:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">Ready to Discover Amazing Events?</h2>
            <p className="mb-8 text-gray-600">
              Join thousands of users who are discovering and booking events every day. Create an account now and get
              started!
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button className="h-12 text-base bg-yellow-500 hover:bg-yellow-600" onClick={handleSignupClick}>Sign Up Now</Button>
              <Button variant="outline" className="h-12 text-base">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      
      <Footer/>
    </div>
  )
}

export default HomePage
