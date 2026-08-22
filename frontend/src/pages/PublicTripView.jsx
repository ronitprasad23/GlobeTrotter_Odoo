import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTrip, getTrips, saveTrips } from '../utils/storage';
import { Calendar, MapPin, IndianRupee, Compass, Copy } from 'lucide-react';

export default function PublicTripView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const trip = getTrip(id);

  if (!trip) {
    return (
      <div className="max-w-md mx-auto my-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Trip Not Found</h2>
        <p className="text-gray-500 mt-2">This shared trip link is invalid or has been deleted.</p>
        <Link to="/" className="mt-6 inline-flex items-center px-4 py-2 text-white bg-primary-600 rounded-md">
          Go Back Home
        </Link>
      </div>
    );
  }

  const totalSpent = trip.expenses ? trip.expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0;
  
  const categories = ['Transport', 'Lodging', 'Food', 'Activities', 'Other'];
  const categoryTotals = categories.reduce((acc, cat) => {
    acc[cat] = trip.expenses ? trip.expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0) : 0;
    return acc;
  }, {});

  const handleCopyTrip = () => {
    const trips = getTrips();
    const copiedTrip = {
      ...trip,
      id: Date.now().toString(),
      name: `Copy of ${trip.name}`,
      isPublic: false
    };
    trips.push(copiedTrip);
    saveTrips(trips);
    alert('Trip successfully copied to your dashboard!');
    navigate('/trips');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8 border-b border-gray-150 pb-4">
        <div className="flex items-center">
          <Compass className="h-8 w-8 text-primary-600 mr-2" />
          <span className="font-bold text-xl text-gray-900">GlobeTrotter Share</span>
        </div>
        <button
          onClick={handleCopyTrip}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <Copy className="h-4 w-4 mr-2" /> Copy Trip to My Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
            <p className="text-gray-500 mt-2 flex items-center text-sm font-medium">
              <Calendar className="h-4 w-4 mr-2" /> {trip.start_date} to {trip.end_date}
            </p>
            <p className="text-gray-600 mt-4 leading-relaxed">{trip.description}</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Shared Itinerary Stops</h2>
          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-gray-200">
            {trip.stops.length === 0 ? (
              <p className="text-gray-500 italic ml-8">No stops added yet.</p>
            ) : (
              trip.stops.map((stop, index) => (
                <div key={stop.id} className="relative flex gap-6 items-start">
                  <div className="absolute left-4 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white font-bold ring-8 ring-white">
                    {index + 1}
                  </div>
                  <div className="ml-8 flex-1 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 text-gray-500 mr-1" /> {stop.city}, {stop.country}
                    </h3>
                    <span className="text-sm text-gray-500 mt-1 block font-medium">{stop.start_date} to {stop.end_date}</span>
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Planned Activities:</h4>
                      {stop.activities.length === 0 ? (
                        <span className="text-gray-500 text-sm italic">No activities planned.</span>
                      ) : (
                        <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2 text-sm">
                          {stop.activities.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <IndianRupee className="h-5 w-5 mr-1 text-primary-600" /> Budget Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Total Budget</span>
                <span className="font-bold text-gray-900">₹{trip.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Estimated Expense</span>
                <span className="font-bold text-gray-950">₹{totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 text-sm">Remaining</span>
                <span className={`font-bold ${trip.budget - totalSpent < 0 ? 'text-red-650' : 'text-emerald-655'}`}>
                  ₹{(trip.budget - totalSpent).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cost Breakdown</h3>
            <div className="space-y-4">
              {categories.map((cat) => {
                const amt = categoryTotals[cat];
                const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-500">
                      <span>{cat}</span>
                      <span>₹{amt.toLocaleString()} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
