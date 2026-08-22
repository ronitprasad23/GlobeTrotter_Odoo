import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrips } from '../utils/storage';
import { Compass, Plus, Calendar, MapPin, TrendingUp, DollarSign } from 'lucide-react';

export default function Home() {
  const [trips] = useState(getTrips());

  const totalTrips = trips.length;
  const totalBudget = trips.reduce((sum, t) => sum + Number(t.budget), 0);
  const totalSpent = trips.reduce((sum, t) => {
    return sum + (t.expenses ? t.expenses.reduce((s, e) => s + e.amount, 0) : 0);
  }, 0);

  const recentTrips = trips.slice(0, 2);

  const popularCities = [
    { name: 'Tokyo', country: 'Japan', cost: 'High', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&auto=format&fit=crop&q=60' },
    { name: 'Paris', country: 'France', cost: 'High', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop&q=60' },
    { name: 'Goa', country: 'India', cost: 'Budget', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop&q=60' },
    { name: 'Rome', country: 'Italy', cost: 'Medium', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&auto=format&fit=crop&q=60' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, Traveler! 🌍</h1>
          <p className="text-gray-500 mt-2 text-lg">Where is your next adventure taking you? Let's plan it together.</p>
        </div>
        <Link
          to="/trips/create"
          className="mt-4 md:mt-0 inline-flex items-center px-5 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-5 w-5 mr-2" /> Plan New Trip
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-lg mr-4">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm text-gray-400 font-medium block">Total Trips</span>
            <span className="text-2xl font-bold text-gray-900">{totalTrips} Planned</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg mr-4">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm text-gray-400 font-medium block">Total Budget Set</span>
            <span className="text-2xl font-bold text-gray-900">₹{totalBudget.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg mr-4">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm text-gray-400 font-medium block">Current Spend</span>
            <span className="text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Recent Trips</h2>
          <Link to="/trips" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            View all trips
          </Link>
        </div>

        {recentTrips.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500 italic">
            No trips planned yet. Click "Plan New Trip" above to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentTrips.map((trip) => {
              const spent = trip.expenses ? trip.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
              const stopsCount = trip.stops ? trip.stops.length : 0;
              const pct = trip.budget > 0 ? Math.min((spent / trip.budget) * 100, 100) : 0;

              return (
                <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{trip.name}</h3>
                      <span className="bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full font-semibold">Active</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {trip.start_date} - {trip.end_date}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {stopsCount} {stopsCount === 1 ? 'Stop' : 'Stops'}
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${spent > trip.budget ? 'bg-red-650' : 'bg-primary-600'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>Spent: ₹{spent.toLocaleString()}</span>
                      <span>Budget: ₹{trip.budget.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
                    <Link to={`/trips/${trip.id}`} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCities.map((city) => (
            <div key={city.name} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={city.image} 
                  alt={city.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-2 py-1 rounded font-semibold">
                  {city.cost} Cost
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 text-lg">{city.name}</h4>
                <p className="text-gray-500 text-sm">{city.country}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
