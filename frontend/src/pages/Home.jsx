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
    <div className="bg-gray-50/50 min-h-screen pb-12">
      {/* Spectacular Hero Banner */}
      <div 
        className="relative bg-cover bg-center h-[420px] flex items-center justify-center text-white"
        style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url("https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&auto=format&fit=crop&q=80")' }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-md">
            Dream. Design. Travel. ✈️
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto font-medium drop-shadow-sm">
            Plan multi-city itineraries, auto-calculate category budgets, and share shared plans with friends easily.
          </p>
          
          {/* Quick Search Card Overlay */}
          <div className="max-w-xl mx-auto bg-white rounded-full shadow-lg p-2 flex items-center border border-gray-100 mt-8 text-gray-800">
            <Search className="h-5 w-5 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search your planned trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-sm focus:outline-none placeholder-gray-400 bg-transparent"
            />
            <Link
              to="/trips/create"
              className="inline-flex items-center px-5 py-2.5 rounded-full text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 transition-all shrink-0 shadow shadow-primary-500/20"
            >
              <Plus className="h-4 w-4 mr-1" /> New Trip
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex items-center hover:translate-y-[-2px] transition-transform duration-200">
            <div className="p-3.5 bg-primary-50 text-primary-500 rounded-xl mr-4 shadow shadow-primary-500/5">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Trips Planned</span>
              <span className="text-2xl font-black text-gray-800">{totalTrips} Trips</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex items-center hover:translate-y-[-2px] transition-transform duration-200">
            <div className="p-3.5 bg-brandTeal-50 text-brandTeal-600 rounded-xl mr-4 shadow shadow-brandTeal-500/5">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Estimated Budget</span>
              <span className="text-2xl font-black text-gray-800">₹{totalBudget.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex items-center hover:translate-y-[-2px] transition-transform duration-200">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl mr-4 shadow shadow-amber-500/5">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Logged Expense</span>
              <span className="text-2xl font-black text-gray-800">₹{totalSpent.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Recent Trips Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Your Plan Dashboard</h2>
              <p className="text-sm text-gray-500">Pick up planning where you left off</p>
            </div>
            <Link to="/trips" className="text-sm font-bold text-primary-500 hover:text-primary-650 transition-colors">
              View all trips &rarr;
            </Link>
          </div>

          {recentTrips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
              <Compass className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-550 font-medium">No active trips match your search.</p>
              <Link 
                to="/trips/create" 
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-full text-white bg-primary-500 hover:bg-primary-600 shadow shadow-primary-500/10"
              >
                Plan a New Trip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentTrips.map((trip) => {
                const spent = trip.expenses ? trip.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
                const stopsCount = trip.stops ? trip.stops.length : 0;
                const pct = trip.budget > 0 ? Math.min((spent / trip.budget) * 100, 100) : 0;

                return (
                  <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{trip.name}</h3>
                        <span className="bg-brandTeal-50 text-brandTeal-700 text-xs px-2.5 py-1 rounded-full font-bold">
                          Active
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center font-medium">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {trip.start_date} to {trip.end_date}
                        </div>
                        <div className="flex items-center font-medium">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {stopsCount} Stop{stopsCount !== 1 && 's'}
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full ${spent > trip.budget ? 'bg-red-600' : 'bg-primary-500'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 font-bold">
                        <span>Spent: ₹{spent.toLocaleString()}</span>
                        <span>Budget: ₹{trip.budget.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
                      <Link to={`/trips/${trip.id}`} className="text-sm font-bold text-primary-500 hover:text-primary-600">
                        Customize Itinerary &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Popular Destinations Grid (Travel Portal Feel) */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900">Explore Recommended Destinations</h2>
            <p className="text-sm text-gray-500">Akshar Travels popular domestic & international packages</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCities.map((city) => (
              <div key={city.name} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src={city.image} 
                    alt={city.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-800 text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-full shadow-sm">
                    {city.cost} Cost
                  </span>
                  <span className="absolute bottom-3 right-3 bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    {city.price}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-900 text-lg">{city.name}</h4>
                    <span className="text-xs text-gray-400 font-semibold">{city.days}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">{city.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
