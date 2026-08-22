import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrip, updateTrip } from '../utils/storage';
import { 
  Calendar, MapPin, IndianRupee, ArrowLeft, Plus, 
  Trash2, Clipboard, ClipboardCheck, AlertTriangle, Info 
} from 'lucide-react';

const POPULAR_CITIES = [
  { name: 'Paris', country: 'France', activities: ['Eiffel Tower Climb', 'Louvre Museum Tour', 'Seine River Cruise', 'Notre-Dame Cathedral'] },
  { name: 'Tokyo', country: 'Japan', activities: ['Shibuya Crossing', 'Senso-ji Temple', 'TeamLab Planets', 'Mount Fuji Day Tour'] },
  { name: 'Goa', country: 'India', activities: ['Anjuna Beach Sunset', 'Baga Water Sports', 'Fort Aguada Visit', 'Dudhsagar Falls Trek'] },
  { name: 'Rome', country: 'Italy', activities: ['Colosseum Tour', 'Vatican City Visit', 'Trevi Fountain Wish', 'Pantheon Exploration'] },
  { name: 'Mumbai', country: 'India', activities: ['Gateway of India', 'Marine Drive Walk', 'Elephanta Caves', 'Haji Ali Dargah'] },
  { name: 'New York', country: 'USA', activities: ['Statue of Liberty', 'Central Park Walk', 'Times Square Lights', 'Empire State Building'] },
  { name: 'London', country: 'UK', activities: ['Tower of London', 'London Eye Flight', 'British Museum Tour', 'Big Ben Photo'] }
];

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary');
  
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [selectedCityObj, setSelectedCityObj] = useState(null);
  const [stopStartDate, setStopStartDate] = useState('');
  const [stopEndDate, setStopEndDate] = useState('');
  const [customCountry, setCustomCountry] = useState('');

  const [customActivityTexts, setCustomActivityTexts] = useState({});

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Transport');

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTrip(getTrip(id));
  }, [id]);

  if (!trip) {
    return (
      <div className="max-w-md mx-auto my-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Trip Not Found</h2>
        <Link to="/trips" className="mt-4 inline-flex items-center text-primary-600 font-semibold">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Trips
        </Link>
      </div>
    );
  }

  const totalSpent = trip.expenses ? trip.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  const isOverBudget = totalSpent > trip.budget;
  const remaining = trip.budget - totalSpent;

  const startD = new Date(trip.start_date);
  const endD = new Date(trip.end_date);
  const diffTime = Math.abs(endD - startD);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const dailyAverage = diffDays > 0 ? (totalSpent / diffDays).toFixed(0) : 0;

  const categories = ['Transport', 'Lodging', 'Food', 'Activities', 'Other'];
  const categoryTotals = categories.reduce((acc, cat) => {
    acc[cat] = trip.expenses ? trip.expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0) : 0;
    return acc;
  }, {});

  const saveTripState = (updatedTrip) => {
    setTrip(updatedTrip);
    updateTrip(id, updatedTrip);
  };

  const handleAddStop = (e) => {
    e.preventDefault();
    if (!citySearch) return;

    const cityName = selectedCityObj ? selectedCityObj.name : citySearch;
    const countryName = selectedCityObj ? selectedCityObj.country : customCountry;

    const newStop = {
      id: Date.now().toString(),
      city: cityName,
      country: countryName || 'Unknown',
      start_date: stopStartDate || trip.start_date,
      end_date: stopEndDate || trip.end_date,
      activities: []
    };

    const updatedStops = [...(trip.stops || []), newStop];
    saveTripState({ ...trip, stops: updatedStops });

    setIsStopModalOpen(false);
    setCitySearch('');
    setSelectedCityObj(null);
    setStopStartDate('');
    setStopEndDate('');
    setCustomCountry('');
  };

  const handleDeleteStop = (stopId) => {
    const updatedStops = trip.stops.filter(s => s.id !== stopId);
    saveTripState({ ...trip, stops: updatedStops });
  };

  const handleAddActivity = (stopId, activityName) => {
    const updatedStops = trip.stops.map(stop => {
      if (stop.id === stopId) {
        if (stop.activities.includes(activityName)) return stop;
        return { ...stop, activities: [...stop.activities, activityName] };
      }
      return stop;
    });
    saveTripState({ ...trip, stops: updatedStops });
  };

  const handleAddCustomActivity = (e, stopId) => {
    e.preventDefault();
    const text = customActivityTexts[stopId];
    if (!text || !text.trim()) return;

    handleAddActivity(stopId, text.trim());
    setCustomActivityTexts({ ...customActivityTexts, [stopId]: '' });
  };

  const handleDeleteActivity = (stopId, activityIndex) => {
    const updatedStops = trip.stops.map(stop => {
      if (stop.id === stopId) {
        const activities = stop.activities.filter((_, idx) => idx !== activityIndex);
        return { ...stop, activities };
      }
      return stop;
    });
    saveTripState({ ...trip, stops: updatedStops });
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;

    const newExpense = {
      id: Date.now().toString(),
      title: expenseTitle,
      amount: Number(expenseAmount),
      category: expenseCategory
    };

    const updatedExpenses = [...(trip.expenses || []), newExpense];
    saveTripState({ ...trip, expenses: updatedExpenses });

    setExpenseTitle('');
    setExpenseAmount('');
  };

  const handleDeleteExpense = (expenseId) => {
    const updatedExpenses = trip.expenses.filter(exp => exp.id !== expenseId);
    saveTripState({ ...trip, expenses: updatedExpenses });
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/${trip.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const togglePublicStatus = () => {
    saveTripState({ ...trip, isPublic: !trip.isPublic });
  };

  const filteredCities = citySearch 
    ? POPULAR_CITIES.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())) 
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link to="/trips" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Trips
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{trip.name}</h1>
            <p className="text-gray-500 mt-2 flex items-center text-sm font-medium">
              <Calendar className="h-4 w-4 mr-2" /> {trip.start_date} to {trip.end_date} ({diffDays} Days)
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <div className="bg-primary-50 rounded-lg p-3 border border-primary-100 flex items-center">
              <IndianRupee className="h-6 w-6 text-primary-600 mr-2" />
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Budget Set</span>
                <span className="text-lg font-extrabold text-primary-600">₹{trip.budget.toLocaleString()}</span>
              </div>
            </div>
            {isOverBudget && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-150 flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-650 mr-2" />
                <div>
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block">Status</span>
                  <span className="text-lg font-extrabold text-red-655">Over Budget!</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-655 mt-4 leading-relaxed text-sm">{trip.description}</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {['itinerary', 'budget', 'share'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-bold text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'itinerary' ? 'Itinerary Builder' : tab === 'budget' ? 'Budget & Expense Tracker' : 'Share Trip'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'itinerary' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Itinerary Stops & Schedule</h2>
            <button
              onClick={() => setIsStopModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Stop
            </button>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-gray-200">
            {(!trip.stops || trip.stops.length === 0) ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500 italic ml-8">
                No stops added to this trip yet. Click "Add Stop" to begin.
              </div>
            ) : (
              trip.stops.map((stop, index) => {
                const isPresetCity = POPULAR_CITIES.find(c => c.name.toLowerCase() === stop.city.toLowerCase());
                
                return (
                  <div key={stop.id} className="relative flex gap-6 items-start">
                    <div className="absolute left-4 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white font-bold ring-8 ring-white">
                      {index + 1}
                    </div>
                    
                    <div className="ml-8 flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <MapPin className="h-5 w-5 text-gray-400 mr-1" /> {stop.city}, {stop.country}
                          </h3>
                          <span className="text-xs text-gray-500 font-semibold block mt-1">
                            {stop.start_date} to {stop.end_date}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteStop(stop.id)}
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Activities Checklist</h4>
                        {stop.activities.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No activities added. Add suggested activities below or input a custom one.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {stop.activities.map((act, i) => (
                              <span 
                                key={i} 
                                className="inline-flex items-center pl-2.5 pr-1 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800"
                              >
                                {act}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteActivity(stop.id, i)}
                                  className="ml-1 text-gray-400 hover:text-red-600 hover:bg-gray-250 p-0.5 rounded-full"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="border-t border-gray-100 pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Explore Activities Suggestions</span>
                            {isPresetCity ? (
                              <div className="flex flex-col gap-1.5">
                                {isPresetCity.activities.map((presetAct) => (
                                  <button
                                    key={presetAct}
                                    onClick={() => handleAddActivity(stop.id, presetAct)}
                                    disabled={stop.activities.includes(presetAct)}
                                    className={`text-left text-xs px-2.5 py-1.5 rounded border border-gray-100 font-medium ${
                                      stop.activities.includes(presetAct) 
                                        ? 'bg-gray-55 text-gray-400 line-through cursor-default' 
                                        : 'bg-primary-50 hover:bg-primary-100 text-primary-700'
                                    }`}
                                  >
                                    + {presetAct}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 italic block">No suggestions available for this destination.</span>
                            )}
                          </div>

                          <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Add Custom Activity</span>
                            <form onSubmit={(e) => handleAddCustomActivity(e, stop.id)} className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Enter activity..."
                                value={customActivityTexts[stop.id] || ''}
                                onChange={(e) => setCustomActivityTexts({ ...customActivityTexts, [stop.id]: e.target.value })}
                                className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                              <button
                                type="submit"
                                className="px-3 py-2 bg-gray-800 hover:bg-gray-950 text-white rounded text-xs font-bold"
                              >
                                Add
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 grid grid-cols-3 gap-4">
              <div className="text-center border-r border-gray-100">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Logged Expense</span>
                <span className="text-xl font-extrabold text-gray-950 block mt-1">₹{totalSpent.toLocaleString()}</span>
              </div>
              <div className="text-center border-r border-gray-100">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Remaining</span>
                <span className={`text-xl font-extrabold block mt-1 ${remaining < 0 ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
                  ₹{remaining.toLocaleString()}
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Daily Average</span>
                <span className="text-xl font-extrabold text-gray-950 block mt-1">₹{Number(dailyAverage).toLocaleString()}/day</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Category Spending Breakdown</h3>
              <div className="space-y-4">
                {categories.map((cat) => {
                  const amt = categoryTotals[cat];
                  const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0;
                  const capPct = Math.min(pct, 100);
                  
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-655">
                        <span>{cat}</span>
                        <span>₹{amt.toLocaleString()} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            cat === 'Transport' ? 'bg-blue-500' :
                            cat === 'Lodging' ? 'bg-indigo-500' :
                            cat === 'Food' ? 'bg-orange-400' :
                            cat === 'Activities' ? 'bg-emerald-500' : 'bg-gray-450'
                          }`}
                          style={{ width: `${capPct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-950 mb-4">Logged Expense Details</h3>
              {(!trip.expenses || trip.expenses.length === 0) ? (
                <p className="text-sm text-gray-500 italic">No expenses logged yet. Log your first expense on the right.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                    <thead>
                      <tr className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {trip.expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-gray-50">
                          <td className="py-3.5 px-4 font-semibold text-gray-950">{exp.title}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                              exp.category === 'Transport' ? 'bg-blue-50 text-blue-700' :
                              exp.category === 'Lodging' ? 'bg-indigo-50 text-indigo-700' :
                              exp.category === 'Food' ? 'bg-orange-50 text-orange-700' :
                              exp.category === 'Activities' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-gray-900">₹{exp.amount.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-gray-400 hover:text-red-650"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-950 mb-4">Log Expense</h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-550 uppercase tracking-wider mb-1">Expense Title</label>
                  <input
                    type="text"
                    required
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="e.g. Airbnb, Taxi to airport"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-550 uppercase tracking-wider mb-1">Amount (INR ₹)</label>
                  <input
                    type="number"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-555 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-semibold shadow-sm"
                >
                  Save Expense
                </button>
              </form>
            </div>

            {isOverBudget && (
              <div className="bg-red-50 border border-red-150 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-650 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-red-700">Over-Budget Warning</h4>
                  <p className="text-xs text-red-600 mt-1 leading-relaxed">
                    You have exceeded your total estimated budget limit by ₹{Math.abs(remaining).toLocaleString()}! Review your expenses or increase the trip budget.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'share' && (
        <div className="max-w-2xl bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Share Itinerary</h2>
            <p className="text-sm text-gray-500 mt-1">Generate a public URL to share your itinerary and budget highlights with family or friends.</p>
          </div>

          <div className="flex justify-between items-center py-4 border-t border-b border-gray-100">
            <div>
              <span className="font-bold text-sm text-gray-900 block">Make Itinerary Public</span>
              <span className="text-xs text-gray-500">Anyone with the link can view (read-only)</span>
            </div>
            <button
              onClick={togglePublicStatus}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                trip.isPublic ? 'bg-primary-600 justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
            </button>
          </div>

          {trip.isPublic ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shareable Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/share/${trip.id}`}
                    className="flex-1 bg-gray-50 px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 focus:outline-none cursor-text select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    {copied ? <ClipboardCheck className="h-4 w-4 mr-2" /> : <Clipboard className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-150 rounded-xl p-4 flex gap-3 text-blue-700">
                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Your team members or friends can click the copied link to view details. They will also be able to copy this entire trip plan structure straight into their own account with a single click.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-550 text-sm italic">
              Sharing is disabled. Enable "Make Itinerary Public" to generate the share link.
            </div>
          )}
        </div>
      )}

      {isStopModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg border border-gray-150 w-full max-w-md p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Add Stop to Itinerary</h3>
              <button
                onClick={() => setIsStopModalOpen(false)}
                className="text-gray-400 hover:text-gray-650 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddStop} className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-bold text-gray-550 uppercase tracking-wider mb-1">Destination City</label>
                <input
                  type="text"
                  required
                  placeholder="Search city (e.g. Paris, Goa, Tokyo...)"
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    const matched = POPULAR_CITIES.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
                    setSelectedCityObj(matched || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                />

                {filteredCities.length > 0 && !selectedCityObj && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-250 shadow-md rounded mt-1 max-h-40 overflow-y-auto divide-y divide-gray-100">
                    {filteredCities.map((city) => (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => {
                          setCitySearch(city.name);
                          setSelectedCityObj(city);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-100 text-gray-800"
                      >
                        {city.name}, {city.country} (Preset)
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!selectedCityObj && (
                <div>
                  <label className="block text-xs font-bold text-gray-550 uppercase tracking-wider mb-1">Country</label>
                  <input
                    type="text"
                    required={!selectedCityObj}
                    placeholder="Enter country..."
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-555 uppercase tracking-wider mb-1">Arrival Date</label>
                  <input
                    type="date"
                    required
                    value={stopStartDate}
                    onChange={(e) => setStopStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-555 uppercase tracking-wider mb-1">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={stopEndDate}
                    onChange={(e) => setStopEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsStopModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded text-xs font-semibold text-white bg-primary-600 hover:bg-primary-750"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
