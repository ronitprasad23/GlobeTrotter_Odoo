import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrips, deleteTrip } from '../utils/storage';
import { Calendar, MapPin, Trash2, ArrowRight, Compass } from 'lucide-react';

export default function MyTrips() {
  const [trips, setTrips] = useState(getTrips());

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the trip "${name}"?`)) {
      deleteTrip(id);
      setTrips(getTrips());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[75vh]">
      {/* Page Title & CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Planned Trips</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your travel stops, durational schedules, and budget limits.</p>
        </div>
        <Link
          to="/trips/create"
          className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-extrabold rounded-full shadow-md text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Plan New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm max-w-xl mx-auto">
          <Compass className="h-16 w-16 text-primary-200 mx-auto mb-4 animate-spin-slow" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No trips planned yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            Get started by entering your destination cities, dates, and budget limits.
          </p>
          <Link
            to="/trips/create"
            className="inline-flex items-center px-6 py-3 text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-full shadow-md shadow-primary-500/10"
          >
            Create Your First Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const spent = trip.expenses ? trip.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
            const stopsCount = trip.stops ? trip.stops.length : 0;
            const pct = trip.budget > 0 ? Math.min((spent / trip.budget) * 100, 100) : 0;
            const isOver = spent > trip.budget;
            
            return (
              <div 
                key={trip.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md hover:translate-y-[-2px] transition-all duration-200"
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 hover:text-primary-600 transition-colors">
                      <Link to={`/trips/${trip.id}`}>{trip.name}</Link>
                    </h3>
                    <button
                      onClick={() => handleDelete(trip.id, trip.name)}
                      className="text-gray-400 hover:text-red-650 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      title="Delete Trip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Dates & Stops info */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-500 text-xs font-semibold">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-primary-500 shrink-0" />
                      {trip.start_date} to {trip.end_date}
                    </div>
                    <div className="flex items-center text-gray-500 text-xs font-semibold">
                      <MapPin className="h-3.5 w-3.5 mr-2 text-brandTeal-600 shrink-0" />
                      {stopsCount} Stop{stopsCount !== 1 && 's'} Planned
                    </div>
                  </div>

                  {/* Budget bar */}
                  <div className="space-y-2">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${isOver ? 'bg-red-600' : 'bg-primary-500'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-extrabold">
                      <span>Spent: ₹{spent.toLocaleString()}</span>
                      <span>Budget: ₹{trip.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer action link */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                  <Link 
                    to={`/trips/${trip.id}`} 
                    className="text-xs font-black text-primary-500 hover:text-primary-600 flex items-center transition-colors"
                  >
                    View Details & Plan stops <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Inline helper for Plus icon since it is used but not imported
function Plus(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
