import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTrip, getTrips, saveTrips, MASTER_CITIES, MASTER_ACTIVITIES } from '../utils/storage';
import { Calendar, MapPin, IndianRupee, Compass, Copy, Share2, Globe, MessageCircle } from 'lucide-react';

export default function PublicTripView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const trip = getTrip(id);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!trip) {
    return (
      <div className="max-w-md mx-auto my-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Trip Not Found</h2>
        <p className="text-gray-550 mt-2">This shared trip link is invalid or has been deleted.</p>
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

  const shareUrl = window.location.href;
  const twitterShare = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out my travel plan: ' + trip.name + ' via GlobeTrotter')}`;
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent('Check out my travel plan: ' + trip.name + ' - ' + shareUrl)}`;

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: trip.name,
        text: trip.description || 'Check out my GlobeTrotter itinerary!',
        url: shareUrl
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    }
  };

  return (
    <div className="app-container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-gray-150 pb-5 gap-4">
        <div className="flex items-center">
          <Compass className="h-9 w-9 text-primary-600 mr-2 shrink-0 animate-spin-slow" />
          <span className="font-extrabold text-2xl text-gray-900 tracking-tight">GlobeTrotter Share</span>
        </div>
        
        {/* Social Sharing toolbar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest mr-1.5 hidden md:block">Share itinerary</span>
          
          <a
            href={twitterShare}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 hover:bg-sky-50 text-gray-700 hover:text-sky-600 rounded-full transition-all border border-gray-200/50 text-xs font-black"
            title="Share on Twitter / X"
          >
            Twitter
          </a>
          <a
            href={facebookShare}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-full transition-all border border-gray-200/50 text-xs font-black"
            title="Share on Facebook"
          >
            Facebook
          </a>
          <a
            href={whatsappShare}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 rounded-full transition-all border border-gray-200/50 text-xs font-black flex items-center gap-1"
            title="Share on WhatsApp"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
          
          <button
            onClick={handleNativeShare}
            className="p-2 bg-gray-150 hover:bg-gray-200 text-gray-800 rounded-full transition-all"
            title="Copy share link"
          >
            <Share2 className="h-4 w-4" />
          </button>
          
          {copiedLink && (
            <span className="text-xs font-bold text-emerald-600 animate-pulse bg-emerald-50 px-2.5 py-1 rounded-md">Copied!</span>
          )}

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          <button
            onClick={handleCopyTrip}
            className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-extrabold rounded-full shadow-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Copy className="h-4 w-4 mr-2" /> Copy Trip to My Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
            <p className="text-gray-550 mt-2 flex items-center text-sm font-medium">
              <Calendar className="h-4 w-4 mr-2" /> {trip.start_date} to {trip.end_date}
            </p>
            <p className="text-gray-655 mt-4 leading-relaxed">{trip.description}</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Shared Itinerary Stops</h2>
          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-gray-200">
            {(!trip.stops || trip.stops.length === 0) ? (
              <p className="text-gray-500 italic ml-8">No stops added yet.</p>
            ) : (
              trip.stops.map((stop, index) => {
                const city = MASTER_CITIES.find(c => c.id === stop.city_id);
                const stopItems = (trip.itinerary_items || [])
                  .filter(item => item.trip_stop_id === stop.id)
                  .sort((a, b) => a.start_time.localeCompare(b.start_time));
                
                return (
                  <div key={stop.id} className="relative flex gap-6 items-start">
                    <div className="absolute left-4 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white font-bold ring-8 ring-white">
                      {index + 1}
                    </div>
                    <div className="ml-8 flex-1 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <MapPin className="h-5 w-5 text-gray-500 mr-1" /> 
                        {city ? `${city.name}, ${city.country}` : 'Custom City'}
                      </h3>
                      <span className="text-sm text-gray-500 mt-1 block font-medium">{stop.start_date} to {stop.end_date}</span>
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Planned Activities:</h4>
                        {stopItems.length === 0 ? (
                          <span className="text-gray-500 text-sm italic">No activities planned.</span>
                        ) : (
                          <ul className="list-disc list-inside text-gray-655 space-y-1 pl-2 text-sm font-semibold">
                            {stopItems.map((item) => {
                              const act = MASTER_ACTIVITIES.find(a => a.id === item.activity_id);
                              return (
                                <li key={item.id}>
                                  {act ? act.name : 'Custom Activity'} ({item.start_time} - {item.end_time})
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <IndianRupee className="h-5 w-5 mr-1 text-primary-600" /> Budget Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-55">
                <span className="text-gray-500 text-sm">Total Budget</span>
                <span className="font-bold text-gray-900">₹{trip.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-55">
                <span className="text-gray-500 text-sm">Estimated Expense</span>
                <span className="font-bold text-gray-955">₹{totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 text-sm">Remaining</span>
                <span className={`font-bold ${trip.budget - totalSpent < 0 ? 'text-red-655' : 'text-emerald-655'}`}>
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
                    <div className="flex justify-between text-xs font-semibold text-gray-555">
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
