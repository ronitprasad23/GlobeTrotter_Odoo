import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrips, deleteTrip, updateTrip } from '../utils/storage';
import { 
  Calendar, MapPin, Trash2, Edit2, ArrowRight, Compass, Plus, 
  IndianRupee, X, Image as ImageIcon 
} from 'lucide-react';

const COVER_PRESETS = [
  { name: 'Mountain Lake', url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80' },
  { name: 'Sandy Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Forest Camper', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80' },
  { name: 'City Skyline', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&auto=format&fit=crop&q=80' }
];

export default function MyTrips() {
  const [trips, setTrips] = useState(getTrips());
  
  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTripId, setEditTripId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBudget, setEditBudget] = useState(50000);
  const [editCover, setEditCover] = useState('');
  const [editCustomCover, setEditCustomCover] = useState('');

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the trip "${name}"?`)) {
      deleteTrip(id);
      setTrips(getTrips());
    }
  };

  const handleOpenEditModal = (trip) => {
    setEditTripId(trip.id);
    setEditName(trip.name);
    setEditStartDate(trip.start_date);
    setEditEndDate(trip.end_date);
    setEditDescription(trip.description || '');
    setEditBudget(trip.budget || 50000);
    
    const isPreset = COVER_PRESETS.some(c => c.url === trip.cover_image);
    if (isPreset) {
      setEditCover(trip.cover_image);
      setEditCustomCover('');
    } else {
      setEditCover('');
      setEditCustomCover(trip.cover_image || '');
    }
    
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const finalCover = editCustomCover.trim() || editCover || COVER_PRESETS[0].url;
    
    updateTrip(editTripId, {
      name: editName,
      start_date: editStartDate,
      end_date: editEndDate,
      description: editDescription,
      budget: Number(editBudget),
      cover_image: finalCover
    });

    setIsEditModalOpen(false);
    setTrips(getTrips());
  };

  return (
    <div className="w-full py-4 min-h-[75vh]">
      {/* Page Title & CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Planned Trips</h1>
          <p className="text-base text-gray-500 mt-2 font-semibold">Manage your travel stops, durational schedules, and budget limits.</p>
        </div>
        <Link
          to="/trips/create"
          className="inline-flex items-center px-6 py-3.5 border border-transparent text-base font-extrabold rounded-full shadow-md text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5 mr-1.5" /> Plan New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm max-w-xl mx-auto">
          <Compass className="h-16 w-16 text-primary-200 mx-auto mb-4 animate-spin-slow" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No trips planned yet</h3>
          <p className="text-base text-gray-500 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Increased grid gap */}
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
                {/* Trip Cover Image (Increased height) */}
                <div className="h-52 w-full overflow-hidden relative">
                  <img 
                    src={trip.cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80'} 
                    alt={trip.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                  
                  {/* Floating Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(trip)}
                      className="bg-white/90 backdrop-blur-xs text-gray-700 hover:text-primary-600 p-2.5 rounded-full shadow-sm transition-colors"
                      title="Edit Trip Settings"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id, trip.name)}
                      className="bg-white/90 backdrop-blur-xs text-gray-700 hover:text-red-600 p-2.5 rounded-full shadow-sm transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-7 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title (Enlarged) */}
                    <h3 className="text-2xl font-bold text-gray-900 leading-snug line-clamp-1 hover:text-primary-600 transition-colors mb-4">
                      <Link to={`/trips/${trip.id}`}>{trip.name}</Link>
                    </h3>
                    
                    {/* Dates & Stops info (Enlarged text size) */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-500 text-sm font-semibold">
                        <Calendar className="h-4.5 w-4.5 mr-2.5 text-primary-500 shrink-0" />
                        {trip.start_date} to {trip.end_date}
                      </div>
                      <div className="flex items-center text-gray-500 text-sm font-semibold">
                        <MapPin className="h-4.5 w-4.5 mr-2.5 text-brandTeal-600 shrink-0" />
                        {stopsCount} Stop{stopsCount !== 1 && 's'} Planned
                      </div>
                    </div>
                  </div>

                  {/* Budget bar */}
                  <div className="space-y-2.5">
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${isOver ? 'bg-red-655' : 'bg-primary-500'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 font-extrabold">
                      <span>Spent: ₹{spent.toLocaleString()}</span>
                      <span>Budget: ₹{trip.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer action link (Enlarged text) */}
                <div className="bg-gray-50 px-7 py-4 border-t border-gray-100 flex justify-end">
                  <Link 
                    to={`/trips/${trip.id}`} 
                    className="text-sm font-black text-primary-500 hover:text-primary-600 flex items-center transition-colors animate-pulse-slow"
                  >
                    View Details & Plan stops <ArrowRight className="h-4.5 w-4.5 ml-1.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Trip Modal Overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg p-6 space-y-6 relative">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">Edit Trip Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-655 p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Trip Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Budget (INR ₹)</label>
                  <input
                    type="number"
                    required
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows="2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-xs bg-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Change Cover Photo</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {COVER_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setEditCover(preset.url);
                        setEditCustomCover('');
                      }}
                      className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        editCover === preset.url && !editCustomCover
                          ? 'border-primary-500 scale-102 shadow-sm shadow-primary-500/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                  </span>
                  <input
                    type="url"
                    placeholder="Or paste custom cover image URL..."
                    value={editCustomCover}
                    onChange={(e) => {
                      setEditCustomCover(e.target.value);
                      setEditCover('');
                    }}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-350 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 shadow shadow-primary-500/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
