import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, IndianRupee, ArrowLeft } from 'lucide-react';

export default function TripDetails() {
  const { id } = useParams();

  const trip = {
    id: id,
    name: 'Summer in Europe',
    start_date: '2026-06-15',
    end_date: '2026-06-30',
    description: 'Exploring France, Switzerland, and Italy with friends.',
    budget: 120000,
    stops: [
      { id: 1, city: 'Paris', country: 'France', start_date: '2026-06-15', end_date: '2026-06-20', activities: ['Louvre Museum Tour', 'Eiffel Tower at Night'] },
      { id: 2, city: 'Interlaken', country: 'Switzerland', start_date: '2026-06-21', end_date: '2026-06-25', activities: ['Paragliding', 'Jungfraujoch Train Trip'] },
      { id: 3, city: 'Rome', country: 'Italy', start_date: '2026-06-26', end_date: '2026-06-30', activities: ['Colosseum Tour', 'Vatican City Visit'] }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/trips" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Trips
      </Link>

      <div className="bg-white rounded-lg shadow p-6 md:p-8 border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-100 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
            <p className="text-gray-500 mt-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2" /> {trip.start_date} to {trip.end_date}
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-primary-50 rounded-lg p-4 border border-primary-100 flex items-center">
            <IndianRupee className="h-8 w-8 text-primary-600 mr-2" />
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-bold">Estimated Budget</span>
              <span className="text-xl font-bold text-primary-600">₹{trip.budget.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <p className="text-gray-600">{trip.description}</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Itinerary Stops</h2>
      <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-gray-200">
        {trip.stops.map((stop, index) => (
          <div key={stop.id} className="relative flex gap-6 items-start">
            <div className="absolute left-4 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white font-bold ring-8 ring-white">
              {index + 1}
            </div>
            <div className="ml-8 flex-1 bg-white rounded-lg shadow p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 mr-1" /> {stop.city}, {stop.country}
                  </h3>
                  <span className="text-sm text-gray-500 mt-1 block">{stop.start_date} to {stop.end_date}</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Planned Activities:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
                  {stop.activities.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
