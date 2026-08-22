import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

export default function MyTrips() {
  const dummyTrips = [
    { id: 1, name: 'Summer in Europe', start_date: '2026-06-15', end_date: '2026-06-30', stops: 3, budget: 120000, spent: 45000 },
    { id: 2, name: 'Goa Weekend Getaway', start_date: '2026-09-10', end_date: '2026-09-13', stops: 1, budget: 25000, spent: 5000 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-500 mt-1">Manage your planned itineraries and budgets</p>
        </div>
        <Link
          to="/trips/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Plan New Trip
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyTrips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{trip.name}</h3>
              <div className="flex items-center text-gray-500 text-sm mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                {trip.start_date} to {trip.end_date}
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                {trip.stops} Stops
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
                  style={{ width: `${(trip.spent / trip.budget) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Spent: ₹{trip.spent.toLocaleString()}</span>
                <span>Budget: ₹{trip.budget.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
              <Link to={`/trips/${trip.id}`} className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center">
                View Details <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
