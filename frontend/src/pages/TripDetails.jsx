import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, IndianRupee, ArrowLeft, Plus, 
  Trash2, Clipboard, ClipboardCheck, AlertTriangle, Info, Clock, CheckSquare
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

  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('globetrotter_auth') || '{}');

  useEffect(() => {
    if (!auth.isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchTripDetails();
  }, [id, auth.isLoggedIn, navigate]);

  const fetchTripDetails = () => {
    fetch(`http://127.0.0.1:8000/api/trips/${id}/`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load trip');
        return res.json();
      })
      .then(data => {
        setTrip(data);
      })
      .catch(err => console.error(err));
  };

  if (!trip) {
    return (
      <div className="max-w-md mx-auto my-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Trip Not Found</h2>
        <Link to="/trips" className="mt-4 inline-flex items-center text-primary-500 font-bold">
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
    fetch(`http://127.0.0.1:8000/api/trips/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify(updatedTrip)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save trip state');
        return res.json();
      })
      .then(data => {
        setTrip(data);
      })
      .catch(err => console.error(err));
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
      {/* Back Link */}
      <Link to="/trips" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary-500 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Trips
      </Link>

      {/* Main Banner Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 relative overflow-hidden">
        {/* Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-amber-500"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{trip.name}</h1>
            <p className="text-gray-550 mt-2 flex items-center text-sm font-semibold">
              <Calendar className="h-4 w-4 mr-2 text-primary-500" /> {trip.start_date} to {trip.end_date} 
              <span className="ml-2 bg-primary-50 text-primary-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {diffDays} Days
              </span>
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl p-4 border border-primary-100 flex items-center flex-1 md:flex-none md:min-w-[160px]">
              <IndianRupee className="h-8 w-8 text-primary-600 mr-3 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Estimated Budget</span>
                <span className="text-xl font-black text-primary-600">₹{trip.budget.toLocaleString()}</span>
              </div>
            </div>
            {isOverBudget && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-150 flex items-center flex-1 md:flex-none">
                <AlertTriangle className="h-8 w-8 text-red-600 mr-3 shrink-0" />
                <div>
                  <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider block">Warning</span>
                  <span className="text-xl font-black text-red-650">Over Budget!</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-650 mt-4 leading-relaxed text-sm max-w-3xl">{trip.description}</p>
      </div>

      {/* Tabs Layout */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {['itinerary', 'budget', 'share'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-black text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-450 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'itinerary' ? 'Itinerary Builder' : tab === 'budget' ? 'Budget & Expenses' : 'Share Trip'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      {activeTab === 'itinerary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Stops Timeline Left (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-gray-900">Your Route Timeline</h2>
              <button
                onClick={() => setIsStopModalOpen(true)}
                className="lg:hidden inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-full shadow text-white bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Stop
              </button>
            </div>

            <div className="space-y-8 relative before:absolute before:inset-y-2 before:left-[17px] before:w-0.5 before:bg-gradient-to-b before:from-primary-500 before:to-amber-500">
              {(!trip.stops || trip.stops.length === 0) ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 italic shadow-sm">
                  No stops added to this trip yet. Use the planner panel to add your destinations!
                </div>
              ) : (
                trip.stops.map((stop, index) => {
                  const isPresetCity = POPULAR_CITIES.find(c => c.name.toLowerCase() === stop.city.toLowerCase());
                  
                  return (
                    <div key={stop.id} className="relative flex gap-6 items-start">
                      {/* Gradient Circle Pin */}
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-amber-500 text-white font-black text-sm shrink-0 shadow-md shadow-primary-500/20 ring-4 ring-white relative z-10">
                        {index + 1}
                      </div>
                      
                      {/* Stop Info Card */}
                      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4 gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-950 flex items-center">
                              <MapPin className="h-5 w-5 text-primary-500 mr-1.5 shrink-0" /> {stop.city}, {stop.country}
                            </h3>
                            <span className="text-xs text-gray-450 font-bold block mt-1.5 flex items-center">
                              <Clock className="h-3 w.5 mr-1" /> {stop.start_date} to {stop.end_date}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteStop(stop.id)}
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded-xl hover:bg-red-50 transition-colors"
                            title="Delete Stop"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Activities section */}
                        <div className="mt-6 border-t border-gray-50 pt-4">
                          <h4 className="font-extrabold text-[10px] text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                            <CheckSquare className="h-3.5 w-3.5 mr-1 text-primary-500" /> Planned Checklist
                          </h4>
                          
                          {stop.activities.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No activities added. Pick suggestions or type a custom one below.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {stop.activities.map((act, i) => (
                                <span 
                                  key={i} 
                                  className="inline-flex items-center pl-3 pr-1 py-1 rounded-full text-xs font-bold bg-primary-50/50 text-primary-800 border border-primary-100/50"
                                >
                                  {act}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteActivity(stop.id, i)}
                                    className="ml-1.5 text-primary-400 hover:text-red-650 hover:bg-primary-100 p-0.5 rounded-full"
                                  >
                                    &times;
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Quick suggestions grids & inputs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 bg-gray-50/30 p-4 rounded-xl border border-gray-50">
                            <div>
                              <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2.5">
                                Suggested Activities
                              </span>
                              {isPresetCity ? (
                                <div className="flex flex-col gap-1.5">
                                  {isPresetCity.activities.map((presetAct) => (
                                    <button
                                      key={presetAct}
                                      onClick={() => handleAddActivity(stop.id, presetAct)}
                                      disabled={stop.activities.includes(presetAct)}
                                      className={`text-left text-xs px-3 py-2 rounded-lg border font-bold transition-all ${
                                        stop.activities.includes(presetAct) 
                                          ? 'bg-gray-100 border-gray-100 text-gray-400 line-through cursor-default' 
                                          : 'bg-white border-gray-200 hover:border-primary-400 hover:bg-primary-50 text-gray-700 hover:text-primary-700 shadow-sm'
                                      }`}
                                    >
                                      + {presetAct}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-450 italic block">No presets for custom cities.</span>
                              )}
                            </div>

                            <div>
                              <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2.5">
                                Custom Activity
                              </span>
                              <form onSubmit={(e) => handleAddCustomActivity(e, stop.id)} className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="e.g. Paragliding, Museum"
                                  value={customActivityTexts[stop.id] || ''}
                                  onChange={(e) => setCustomActivityTexts({ ...customActivityTexts, [stop.id]: e.target.value })}
                                  className="flex-1 text-xs px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                                />
                                <button
                                  type="submit"
                                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
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

          {/* Planner Side Panel Right (1/3 width) */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">Route Planner</h3>
              <p className="text-xs text-gray-500 mb-6">
                Add travel stops to map out the journey timeline. Popular destinations auto-fill country and checklist suggestions.
              </p>
              
              <button
                onClick={() => setIsStopModalOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold rounded-full shadow shadow-primary-500/20 text-sm flex items-center justify-center transition-all"
              >
                <Plus className="h-5 w-5 mr-1" /> Add New Destination Stop
              </button>
            </div>

            {/* Quick Summary stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">Itinerary Summary</h3>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between py-2 border-b border-gray-50 text-gray-655">
                  <span>Planned Destinations</span>
                  <span className="font-extrabold text-gray-950">{trip.stops ? trip.stops.length : 0} Cities</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50 text-gray-655">
                  <span>Start Date</span>
                  <span className="font-extrabold text-gray-950">{trip.start_date}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50 text-gray-655">
                  <span>End Date</span>
                  <span className="font-extrabold text-gray-950">{trip.end_date}</span>
                </div>
                <div className="flex justify-between py-2 text-gray-655">
                  <span>Total Duration</span>
                  <span className="font-extrabold text-gray-950">{diffDays} Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Budget Logs and Breakdown Left (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Row */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-3 gap-4">
              <div className="text-center border-r border-gray-100">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Logged Expense</span>
                <span className="text-xl font-black text-gray-900 block mt-1">₹{totalSpent.toLocaleString()}</span>
              </div>
              <div className="text-center border-r border-gray-100">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Remaining</span>
                <span className={`text-xl font-black block mt-1 ${remaining < 0 ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
                  ₹{remaining.toLocaleString()}
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Daily Average</span>
                <span className="text-xl font-black text-gray-900 block mt-1">₹{Number(dailyAverage).toLocaleString()}</span>
              </div>
            </div>

            {/* Category spending bar graphs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-black text-gray-900 mb-6">Category Spending Breakdown</h3>
              <div className="space-y-4">
                {categories.map((cat) => {
                  const amt = categoryTotals[cat];
                  const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0;
                  const capPct = Math.min(pct, 100);
                  
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-550">
                        <span>{cat}</span>
                        <span>₹{amt.toLocaleString()} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-150 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            cat === 'Transport' ? 'bg-blue-500 shadow-sm shadow-blue-500/20' :
                            cat === 'Lodging' ? 'bg-indigo-500 shadow-sm shadow-indigo-500/20' :
                            cat === 'Food' ? 'bg-orange-400 shadow-sm shadow-orange-500/20' :
                            cat === 'Activities' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-gray-450'
                          }`}
                          style={{ width: `${capPct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Log list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">Logged Expense Details</h3>
              {(!trip.expenses || trip.expenses.length === 0) ? (
                <p className="text-sm text-gray-500 italic py-4">No expenses logged yet. Log your first expense on the right.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-250 text-left text-sm">
                    <thead>
                      <tr className="text-gray-400 uppercase tracking-wider text-[10px] font-extrabold">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {trip.expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-gray-50/50">
                          <td className="py-3.5 px-4 font-bold text-gray-900">{exp.title}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              exp.category === 'Transport' ? 'bg-blue-50 text-blue-700 border border-blue-100/50' :
                              exp.category === 'Lodging' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/50' :
                              exp.category === 'Food' ? 'bg-orange-50 text-orange-700 border border-orange-100/50' :
                              exp.category === 'Activities' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-gray-950">₹{exp.amount.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-gray-400 hover:text-red-650 p-1 rounded hover:bg-red-50"
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

          {/* Budget Forms Right (1/3 width) */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-black text-gray-955 mb-4">Log Expense</h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expense Title</label>
                  <input
                    type="text"
                    required
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="e.g. Flight to Paris, Resort deposit"
                    className="w-full px-3.5 py-2.5 border border-gray-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Amount (INR ₹)</label>
                  <input
                    type="number"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3.5 py-2.5 border border-gray-255 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-255 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-full text-sm font-extrabold shadow-sm transition-all"
                >
                  Save Logged Expense
                </button>
              </form>
            </div>

            {isOverBudget && (
              <div className="bg-red-50 border border-red-150 rounded-2xl p-5 flex gap-3 text-red-800 shadow-sm animate-pulse">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-650" />
                <div>
                  <h4 className="font-extrabold text-sm text-red-700">Over-Budget Triggered</h4>
                  <p className="text-xs text-red-600 mt-1 leading-relaxed">
                    Total expenses have exceeded the trip budget limit by ₹{Math.abs(remaining).toLocaleString()}! Review spent logs.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'share' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-gray-900">Share Itinerary</h2>
            <p className="text-sm text-gray-500 mt-1">Generate a public URL to share your itinerary and budget highlights with family or friends.</p>
          </div>

          <div className="flex justify-between items-center py-4 border-t border-b border-gray-100">
            <div>
              <span className="font-bold text-sm text-gray-900 block">Make Itinerary Public</span>
              <span className="text-xs text-gray-550">Anyone with the link can view (read-only)</span>
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
                    className="flex-1 bg-gray-50 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 focus:outline-none cursor-text select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-extrabold rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-600 transition-all shrink-0"
                  >
                    {copied ? <ClipboardCheck className="h-4 w-4 mr-2" /> : <Clipboard className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-150 rounded-xl p-4 flex gap-3 text-blue-800">
                <Info className="h-5 w-5 shrink-0 mt-0.5 text-blue-650" />
                <p className="text-xs leading-relaxed">
                  Your team members or friends can click the copied link to view details. They will also be able to copy this entire trip plan structure straight into their own account with a single click.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm italic">
              Sharing is disabled. Enable "Make Itinerary Public" to generate the share link.
            </div>
          )}
        </div>
      )}

      {/* Add Stop Modal Overlay */}
      {isStopModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-905">Add Stop to Itinerary</h3>
              <button
                onClick={() => setIsStopModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
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
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
                />

                {filteredCities.length > 0 && !selectedCityObj && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 shadow-lg rounded-xl mt-1 max-h-40 overflow-y-auto divide-y divide-gray-100">
                    {filteredCities.map((city) => (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => {
                          setCitySearch(city.name);
                          setSelectedCityObj(city);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 text-gray-700"
                      >
                        {city.name}, {city.country} (Preset)
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!selectedCityObj && (
                <div>
                  <label className="block text-xs font-bold text-gray-555 uppercase tracking-wider mb-1">Country</label>
                  <input
                    type="text"
                    required={!selectedCityObj}
                    placeholder="Enter country..."
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
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
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-555 uppercase tracking-wider mb-1">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={stopEndDate}
                    onChange={(e) => setStopEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsStopModalOpen(false)}
                  className="px-4 py-2 border border-gray-350 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 shadow shadow-primary-500/10"
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
