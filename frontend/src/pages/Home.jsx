import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTrips, addTrip } from '../utils/storage';
import { 
  Compass, Plus, Calendar, MapPin, TrendingUp, DollarSign, Search
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState(getTrips());
  const [searchQuery, setSearchQuery] = useState('');

  const totalTrips = trips.length;
  const totalBudget = trips.reduce((sum, t) => sum + Number(t.budget), 0);
  const totalSpent = trips.reduce((sum, t) => {
    return sum + (t.expenses ? t.expenses.reduce((s, e) => s + e.amount, 0) : 0);
  }, 0);

  const filteredTrips = trips.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const recentTrips = filteredTrips.slice(0, 2);

  const popularCities = [
    { id: '20', name: 'Tokyo', country: 'Japan', cost: 'High', days: '5 Days', price: '₹85,000', cost_index: 4.0, image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&auto=format&fit=crop&q=60' },
    { id: '10', name: 'Paris', country: 'France', cost: 'High', days: '7 Days', price: '₹1,20,000', cost_index: 3.5, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop&q=60' },
    { id: '30', name: 'Goa', country: 'India', cost: 'Budget', days: '3 Days', price: '₹15,005', cost_index: 1.5, image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop&q=60' },
    { id: '40', name: 'Rome', country: 'Italy', cost: 'Medium', days: '6 Days', price: '₹95,000', cost_index: 3.0, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&auto=format&fit=crop&q=60' }
  ];

  const handleQuickPlan = (cityName, country, costIndex, imageUrl) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 5);
    const returnDateStr = returnDate.toISOString().split('T')[0];

    const newTrip = addTrip(
      `Trip to ${cityName}`,
      todayStr,
      returnDateStr,
      `Quick planned journey to explore the popular sights and local culture of ${cityName}, ${country}.`,
      costIndex > 3.0 ? 95000 : 35000,
      imageUrl
    );

    // Prepopulate a stop for that city
    const cityId = popularCities.find(c => c.name === cityName)?.id || '10';
    const updatedStops = [
      {
        id: Date.now().toString(),
        city_id: cityId,
        start_date: todayStr,
        end_date: returnDateStr,
        stop_order: 1
      }
    ];
    
    // Save stops directly
    const tripsList = getTrips();
    const matchIdx = tripsList.findIndex(t => t.id === newTrip.id);
    if (matchIdx !== -1) {
      tripsList[matchIdx].stops = updatedStops;
      localStorage.setItem('globetrotter_trips', JSON.stringify(tripsList));
    }

    setTrips(getTrips());
    navigate(`/trips/${newTrip.id}`);
  };

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      {/* Spectacular Hero Banner */}
      <div 
        className="relative bg-cover bg-center h-[460px] flex items-center justify-center text-white"
        style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url("https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&auto=format&fit=crop&q=80")' }}
      >
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-primary-200 border border-white/10">
            ✈️ GlobeTrotter Planner v2.0
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-md leading-tight">
            Plan Trips Instantly
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-4xl mx-auto font-semibold drop-shadow-sm leading-relaxed">
            One-click quick plan cards, instant itinerary builders, and automated budget breakdowns.
          </p>
          
          {/* Quick Search Card Overlay */}
          <div className="max-w-3xl mx-auto bg-white rounded-full shadow-lg p-2.5 flex items-center border border-gray-105 mt-10 text-gray-800">
            <Search className="h-6 w-6 text-gray-400 ml-4 shrink-0" />
            <input
              type="text"
              placeholder="Search your planned trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 text-base focus:outline-none placeholder-gray-400 bg-transparent font-semibold"
            />
            <Link
              to="/trips/create"
              className="inline-flex items-center px-6 py-3 rounded-full text-sm font-extrabold text-white bg-primary-500 hover:bg-primary-600 transition-all shrink-0 shadow shadow-primary-500/20"
            >
              <Plus className="h-5 w-5 mr-1" /> Plan New Trip
            </Link>
          </div>
        </div>
      </div>

      <div className="app-container -mt-12 relative z-10">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex items-center hover:translate-y-[-2px] transition-transform duration-200">
            <div className="p-3 bg-primary-50 text-primary-500 rounded-xl mr-5">
              <Compass className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Trips Planned</span>
              <span className="text-2xl font-black text-gray-800">{totalTrips} Trips</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex items-center hover:translate-y-[-2px] transition-transform duration-200">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mr-5">
              <DollarSign className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Estimated Budget</span>
              <span className="text-2xl font-black text-gray-800">₹{totalBudget.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex items-center hover:translate-y-[-2px] transition-transform duration-200">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl mr-5">
              <TrendingUp className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Logged Expense</span>
              <span className="text-2xl font-black text-gray-800">₹{totalSpent.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Recent Trips Section */}
        <div className="mb-14">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Your Plan Dashboard</h2>
              <p className="text-sm text-gray-500 mt-1 font-semibold">Pick up planning where you left off</p>
            </div>
            <Link to="/trips" className="text-base font-bold text-primary-500 hover:text-primary-650 transition-colors mb-1">
              View all trips &rarr;
            </Link>
          </div>

          {recentTrips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-105 p-16 text-center shadow-sm">
              <Compass className="h-14 w-14 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-555 font-bold text-lg">No active trips match your search.</p>
              <Link 
                to="/trips/create" 
                className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-full text-white bg-primary-500 hover:bg-primary-600 shadow"
              >
                Plan a New Trip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recentTrips.map((trip) => {
                const spent = trip.expenses ? trip.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
                const stopsCount = trip.stops ? trip.stops.length : 0;
                const pct = trip.budget > 0 ? Math.min((spent / trip.budget) * 100, 100) : 0;

                return (
                  <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="p-6 md:p-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 line-clamp-1">{trip.name}</h3>
                        <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-black">
                          Active
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-500 mb-5">
                        <div className="flex items-center font-bold">
                          <Calendar className="h-4.5 w-4.5 mr-2 text-primary-500 shrink-0" />
                          {trip.start_date} to {trip.end_date}
                        </div>
                        <div className="flex items-center font-bold">
                          <MapPin className="h-4.5 w-4.5 mr-2 text-teal-650 shrink-0" />
                          {stopsCount} Stop{stopsCount !== 1 && 's'} Planned
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
                        <div 
                          className={`h-2.5 rounded-full ${spent > trip.budget ? 'bg-red-655' : 'bg-primary-500'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 font-extrabold">
                        <span>Spent: ₹{spent.toLocaleString()}</span>
                        <span>Budget: ₹{trip.budget.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 md:px-8 py-4 border-t border-gray-100 flex justify-end">
                      <Link to={`/trips/${trip.id}`} className="text-sm font-black text-primary-500 hover:text-primary-650">
                        Customize Itinerary &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Popular Destinations Grid */}
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Explore Recommended Destinations</h2>
            <p className="text-sm text-gray-550 mt-1 font-semibold">One-click planning helper packages to launch instantly</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularCities.map((city) => (
              <div key={city.name} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={city.image} 
                      alt={city.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-800 text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-full shadow-sm">
                      {city.cost} Cost
                    </span>
                    <span className="absolute bottom-3 right-3 bg-primary-500 text-white text-xs font-black px-3 py-1 rounded-full shadow">
                      {city.price}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-lg line-clamp-1">{city.name}</h4>
                      <span className="text-xs text-gray-400 font-bold shrink-0">{city.days}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1 font-semibold">{city.country}</p>
                  </div>
                </div>
                
                {/* Instant Planner Quick Action */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleQuickPlan(city.name, city.country, city.cost_index, city.image)}
                    className="w-full py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors border border-primary-100/50"
                  >
                    <Compass className="h-3.5 w-3.5" /> Quick Plan Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
