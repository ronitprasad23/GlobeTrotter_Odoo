import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrips } from '../utils/storage';
import { Compass, Plus, Calendar, MapPin, TrendingUp, DollarSign, Search } from 'lucide-react';

export default function Home() {
  const [trips] = useState(getTrips());
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
    { name: 'Tokyo', country: 'Japan', cost: 'High', days: '5 Days', price: '₹85,000', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&auto=format&fit=crop&q=60' },
    { name: 'Paris', country: 'France', cost: 'High', days: '7 Days', price: '₹1,20,000', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop&q=60' },
    { name: 'Goa', country: 'India', cost: 'Budget', days: '3 Days', price: '₹15,000', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop&q=60' },
    { name: 'Rome', country: 'Italy', cost: 'Medium', days: '6 Days', price: '₹95,000', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&auto=format&fit=crop&q=60' }
  ];

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      {/* Spectacular Hero Banner */}
      <div 
        className="relative bg-cover bg-center h-[520px] flex items-center justify-center text-white"
        style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url("https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&auto=format&fit=crop&q=80")' }}
      >
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h1 className="text-6xl md:text-7xl font-black tracking-tight drop-shadow-md leading-tight">
            Dream. Design. Travel. ✈️
          </h1>
          <p className="text-2xl md:text-3xl text-gray-100 max-w-4xl mx-auto font-bold drop-shadow-sm leading-relaxed">
            Plan multi-city itineraries, auto-calculate category budgets, and share shared plans with friends easily.
          </p>
          
          {/* Quick Search Card Overlay (Scaled Up) */}
          <div className="max-w-3xl mx-auto bg-white rounded-full shadow-lg p-3 flex items-center border border-gray-100 mt-12 text-gray-800">
            <Search className="h-7 w-7 text-gray-400 ml-5 shrink-0" />
            <input
              type="text"
              placeholder="Search your planned trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-5 py-3 text-lg focus:outline-none placeholder-gray-400 bg-transparent font-semibold"
            />
            <Link
              to="/trips/create"
              className="inline-flex items-center px-8 py-4 rounded-full text-base font-extrabold text-white bg-primary-500 hover:bg-primary-600 transition-all shrink-0 shadow shadow-primary-500/20"
            >
              <Plus className="h-6 w-6 mr-1.5" /> Plan New Trip
            </Link>
          </div>
        </div>
      </div>

      <div className="app-container -mt-16 relative z-10">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-md flex items-center hover:translate-y-[-2px] transition-transform duration-200">
            <div className="p-4 bg-primary-50 text-primary-500 rounded-xl mr-6 shadow shadow-primary-500/5">
              <Compass className="h-8 w-8" />
            </div>
            <div>
              <span className="text-sm text-gray-450 font-bold uppercase tracking-wider block">Trips Planned</span>
              <span className="text-3xl font-black text-gray-800">{totalTrips} Trips</span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-md flex items-center hover:translate-y-[-2px] transition-transform duration-200">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl mr-6 shadow">
              <DollarSign className="h-8 w-8" />
            </div>
            <div>
              <span className="text-sm text-gray-455 font-bold uppercase tracking-wider block">Estimated Budget</span>
              <span className="text-3xl font-black text-gray-800">₹{totalBudget.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-md flex items-center hover:translate-y-[-2px] transition-transform duration-200">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-xl mr-6 shadow">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <span className="text-sm text-gray-455 font-bold uppercase tracking-wider block">Logged Expense</span>
              <span className="text-3xl font-black text-gray-800">₹{totalSpent.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Recent Trips Section */}
        <div className="mb-14">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Your Plan Dashboard</h2>
              <p className="text-base text-gray-500 mt-1.5 font-semibold">Pick up planning where you left off</p>
            </div>
            <Link to="/trips" className="text-lg font-bold text-primary-500 hover:text-primary-650 transition-colors mb-1">
              View all trips &rarr;
            </Link>
          </div>

          {recentTrips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
              <Compass className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-xl">No active trips match your search.</p>
              <Link 
                to="/trips/create" 
                className="mt-5 inline-flex items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-primary-500 hover:bg-primary-600 shadow"
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
                    <div className="p-8 md:p-10">
                      <div className="flex justify-between items-start mb-5">
                        <h3 className="text-3xl font-bold text-gray-900 line-clamp-1">{trip.name}</h3>
                        <span className="bg-emerald-50 text-emerald-700 text-xs px-3.5 py-1.5 rounded-full font-black">
                          Active
                        </span>
                      </div>
                      <div className="space-y-3 text-base md:text-lg text-gray-500 mb-6">
                        <div className="flex items-center font-bold">
                          <Calendar className="h-5 w-5 mr-2.5 text-primary-500 shrink-0" />
                          {trip.start_date} to {trip.end_date}
                        </div>
                        <div className="flex items-center font-bold">
                          <MapPin className="h-5 w-5 mr-2.5 text-brandTeal-600 shrink-0" />
                          {stopsCount} Stop{stopsCount !== 1 && 's'} Planned
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3.5 mb-4">
                        <div 
                          className={`h-3.5 rounded-full ${spent > trip.budget ? 'bg-red-655' : 'bg-primary-500'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm md:text-base text-gray-500 font-extrabold">
                        <span>Spent: ₹{spent.toLocaleString()}</span>
                        <span>Budget: ₹{trip.budget.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-8 md:px-10 py-5 border-t border-gray-100 flex justify-end">
                      <Link to={`/trips/${trip.id}`} className="text-base font-black text-primary-500 hover:text-primary-600">
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
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Explore Recommended Destinations</h2>
            <p className="text-base text-gray-500 mt-2 font-semibold">Akshar Travels popular domestic & international packages</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularCities.map((city) => (
              <div key={city.name} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={city.image} 
                    alt={city.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-gray-800 text-xs uppercase tracking-wider font-black px-3.5 py-1.5 rounded-full shadow-sm">
                    {city.cost} Cost
                  </span>
                  <span className="absolute bottom-4 right-4 bg-primary-500 text-white text-sm font-black px-4 py-1.5 rounded-full shadow">
                    {city.price}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-xl line-clamp-1">{city.name}</h4>
                    <span className="text-sm text-gray-400 font-bold shrink-0">{city.days}</span>
                  </div>
                  <p className="text-gray-500 text-base mt-1.5 font-semibold">{city.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
