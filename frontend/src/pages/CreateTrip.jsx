import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addTrip } from '../utils/storage';
import { Calendar, ArrowLeft } from 'lucide-react';

export default function CreateTrip() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(50000);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTrip = addTrip(name, startDate, endDate, description, budget);
    navigate(`/trips/${newTrip.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back Link */}
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary-500 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </button>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-amber-500"></div>

        <h1 className="text-2xl font-black text-gray-950 mb-2">Plan a New Adventure</h1>
        <p className="text-sm text-gray-500 mb-6">Define your travel dates, estimated budget, and general description.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Trip Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Euro Summer 2026, Rajasthan Heritage Tour"
              className="w-full px-3.5 py-2.5 border border-gray-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-255 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Budget (INR ₹)</label>
              <input
                type="number"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="50000"
                className="w-full px-3.5 py-2.5 border border-gray-255 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">General Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Exploring cities, tasting local cuisine, and beach hopping..."
              className="w-full px-3.5 py-2.5 border border-gray-255 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-gray-300 rounded-full text-xs font-bold text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 border border-transparent rounded-full shadow text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
            >
              Plan Trip &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
