import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"

export const Footer =()=>{
    return(
         <footer className="py-10 bg-yellow-500 text-yellow-950">
        <div className="w-full px-4 mx-auto md:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-8 h-8 text-yellow-950" />
                <span className="text-xl font-bold text-yellow-950">Planzo</span>
              </div>
              <p className="mb-4 text-sm text-yellow-900">
                Discover, book, and manage events with ease. From concerts to conferences, find your next experience
                with Planzo.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-yellow-950">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-yellow-950">Event Categories</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Concerts
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Conferences
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Exhibitions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sports
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Theater
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-yellow-950">Subscribe</h3>
              <p className="mb-4 text-sm text-yellow-900">Stay updated with the latest events and offers.</p>
              <div className="flex gap-2">
                <Input placeholder="Your email" className="h-10 bg-yellow-50 border-yellow-400" />
                <Button className="h-10 bg-yellow-800 hover:bg-yellow-900 text-yellow-50">Subscribe</Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t border-yellow-400 md:flex-row">
            <p className="text-sm text-yellow-900">© {new Date().getFullYear()} EventGold. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-yellow-900 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-yellow-900 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-yellow-900 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    )
}

export default Footer