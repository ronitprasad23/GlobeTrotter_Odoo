import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrips, deleteTrip } from '../utils/storage';
import { Calendar, MapPin, Trash2 } from 'lucide-react';

export default function MyTrips() {
  const [trips, setTrips] = useState(getTrips());

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the trip "${name}"?`)) {
      deleteTrip(id);
      setTrips(getTrips());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-500 mt-1">Manage your planned itineraries and budgets</p>
        </div>
        <Link
          to="/trips/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Plan New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-12 text-center">
          <p className="text-gray-500 text-lg">No trips planned yet.</p>
          <Link
            to="/trips/create"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-primary-600 hover:bg-primary-700"
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
            
            return (
              <div key={trip.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{trip.name}</h3>
                    <button
                      onClick={() => handleDelete(trip.id, trip.name)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-2 font-medium">
                    <Calendar className="h-4 w-4 mr-2" />
                    {trip.start_date} to {trip.end_date}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-4 font-medium">
                    <MapPin className="h-4 w-4 mr-2" />
                    {stopsCount} {stopsCount === 1 ? 'Stop' : 'Stops'}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                    <div 
                      className={`h-2.5 rounded-full ${spent > trip.budget ? 'bg-red-650' : 'bg-primary-600'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 font-semibold">
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
  );
}
