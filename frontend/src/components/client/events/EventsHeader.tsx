import { Search, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const EventsHero = () => {
  return (
       <section className="relative bg-gradient-to-br from-yellow-400 min-h-[400px] flex items-center justify-center overflow-hidden">

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-black/5" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
            Discover Amazing
            <span className="block text-gray-700"> Events Near You</span>
          </h1>
          
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            From music festivals to tech conferences, find and join events that match your interests
          </p>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 max-w-3xl mx-auto shadow-yellow-glow border border-yellow-soft/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-primary w-4 h-4" />
                <Input 
                  placeholder="Search events, venues, or organizers..."
                  className="pl-10 h-12 text-base bg-white border-yellow-primary/30 focus:border-yellow-primary focus:ring-yellow-primary"
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="h-12 px-6 bg-white hover:bg-yellow-light/10 border-yellow-primary/30 text-yellow-primary hover:text-accent-foreground">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-6 bg-white hover:bg-yellow-light/10 border-yellow-primary/30 text-yellow-primary hover:text-accent-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Dates
                </Button>
                <Button size="lg" className="h-12 px-8 bg-gradient-yellow-warm hover:shadow-yellow-warm text-gray-800 shadow-lg transition-all duration-300 font-semibold">
                  Search
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="text-gray-700 font-medium">Popular:</span>
            {['Music', 'Technology', 'Food & Drink', 'Art', 'Business'].map((category) => (
              <Button 
                key={category}
                variant="ghost" 
                size="sm"
                className="h-8 px-3 text-gray-700 hover:bg-yellow-soft/50 hover:text-gray-800 border border-yellow-primary/30 hover:border-yellow-primary/50 transition-all duration-200"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};