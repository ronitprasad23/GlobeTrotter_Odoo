import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrip, updateTrip, getCities, addCity, MASTER_ACTIVITIES } from '../utils/storage';
import { 
  Calendar as CalendarIcon, MapPin, IndianRupee, ArrowLeft, Plus, 
  Trash2, Clipboard, ClipboardCheck, AlertTriangle, Info, Clock, CheckSquare,
  ArrowUp, ArrowDown, List, Calendar, HelpCircle, GripVertical, Search, X, Star, BarChart3
} from 'lucide-react';

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [citiesList, setCitiesList] = useState([]);
  
  // Navigation tabs: 'builder', 'view', 'budget', 'share'
  const [activeTab, setActiveTab] = useState('builder');
  // Itinerary View toggle: 'list' vs 'calendar'
  const [viewMode, setViewMode] = useState('list');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // Manage Cities Modal States
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityCountry, setNewCityCountry] = useState('');
  const [newCityRegion, setNewCityRegion] = useState('');
  const [newCityCost, setNewCityCost] = useState('2.0');
  const [newCityPopularity, setNewCityPopularity] = useState('80');
  const [newCityImageUrl, setNewCityImageUrl] = useState('');

  // Add Stop Modal States
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [stopStartDate, setStopStartDate] = useState('');
  const [stopEndDate, setStopEndDate] = useState('');

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Add Itinerary Item Form States
  const [selectedStopIdForActivity, setSelectedStopIdForActivity] = useState('');
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityDate, setActivityDate] = useState('');
  const [activitySource, setActivitySource] = useState('preset'); // 'preset' vs 'custom'
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [customActivityName, setCustomActivityName] = useState('');
  const [customActivityType, setCustomActivityType] = useState('Sightseeing');
  const [customActivityCost, setCustomActivityCost] = useState('0');
  const [customActivityDuration, setCustomActivityDuration] = useState('60');
  const [activityStartTime, setActivityStartTime] = useState('10:00');
  const [activityEndTime, setActivityEndTime] = useState('12:00');

  // Budget States
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Transport');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadedTrip = getTrip(id);
    if (loadedTrip) {
      setTrip(loadedTrip);
      if (loadedTrip.start_date) {
        setActivityDate(loadedTrip.start_date);
        setSelectedCalendarDate(loadedTrip.start_date);
      }
    }
    const currentCities = getCities();
    setCitiesList(currentCities);
    if (currentCities.length > 0) {
      setSelectedCityId(currentCities[0].id);
    }
  }, [id]);

  if (!trip) {
    return (
      <div className="max-w-md mx-auto my-12 text-center">
        <h2 className="text-3xl font-black text-gray-900">Trip Not Found</h2>
        <Link to="/trips" className="mt-4 inline-flex items-center text-primary-500 font-bold">
          <ArrowLeft className="h-5 w-5 mr-1" /> Back to My Trips
        </Link>
      </div>
    );
  }

  // Calculate Dates
  const startD = new Date(trip.start_date);
  const endD = new Date(trip.end_date);
  const diffDays = Math.ceil(Math.abs(endD - startD) / (1000 * 60 * 60 * 24)) + 1;

  // Generate Date Range Array
  const getDateRange = () => {
    const dates = [];
    const current = new Date(trip.start_date);
    while (current <= endD) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };
  const tripDateList = getDateRange();

  // Budget calculations
  const totalSpent = (trip.expenses ? trip.expenses.reduce((sum, e) => sum + e.amount, 0) : 0);
  const isOverBudget = totalSpent > trip.budget;
  const remaining = trip.budget - totalSpent;

  const categories = ['Transport', 'Lodging', 'Food', 'Activities', 'Other'];
  const categoryTotals = categories.reduce((acc, cat) => {
    acc[cat] = trip.expenses ? trip.expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0) : 0;
    return acc;
  }, {});

  const saveTripState = (updatedTrip) => {
    setTrip(updatedTrip);
    updateTrip(id, updatedTrip);
  };

  // 1. ADD TRIP STOP
  const handleAddStop = (e) => {
    e.preventDefault();
    if (!selectedCityId) return;

    const stopOrder = (trip.stops ? trip.stops.length : 0) + 1;
    const newStop = {
      id: Date.now().toString(),
      city_id: selectedCityId,
      start_date: stopStartDate || trip.start_date,
      end_date: stopEndDate || trip.end_date,
      stop_order: stopOrder
    };

    const updatedStops = [...(trip.stops || []), newStop];
    saveTripState({ ...trip, stops: updatedStops });

    setIsStopModalOpen(false);
    setStopStartDate('');
    setStopEndDate('');
  };

  // 2. NATIVE DRAG-AND-DROP HANDLERS
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newStops = [...(trip.stops || [])];
    const draggedStop = newStops[draggedIndex];

    newStops.splice(draggedIndex, 1);
    newStops.splice(targetIndex, 0, draggedStop);

    const updatedStops = newStops.map((stop, idx) => ({
      ...stop,
      stop_order: idx + 1
    }));

    saveTripState({ ...trip, stops: updatedStops });
    setDraggedIndex(null);
  };

  const handleDeleteStop = (stopId) => {
    const remainingStops = (trip.stops || []).filter(s => s.id !== stopId);
    const resetStops = remainingStops.map((s, idx) => ({ ...s, stop_order: idx + 1 }));
    const remainingItems = (trip.itinerary_items || []).filter(item => item.trip_stop_id !== stopId);
    
    saveTripState({ ...trip, stops: resetStops, itinerary_items: remainingItems });
  };

  // 3. DYNAMIC CITY CREATION
  const handleAddCity = (e) => {
    e.preventDefault();
    if (!newCityName || !newCityCountry) return;

    const added = addCity(
      newCityName,
      newCityCountry,
      newCityRegion,
      newCityCost,
      newCityPopularity,
      newCityImageUrl
    );

    const freshCitiesList = getCities();
    setCitiesList(freshCitiesList);
    setSelectedCityId(added.id);

    setNewCityName('');
    setNewCityCountry('');
    setNewCityRegion('');
    setNewCityCost('2.0');
    setNewCityPopularity('80');
    setNewCityImageUrl('');
    setIsAddingCity(false);
  };

  // 4. ADD ITINERARY ITEM
  const handleOpenActivityModal = (stopId) => {
    setSelectedStopIdForActivity(stopId);
    const stop = trip.stops.find(s => s.id === stopId);
    if (stop) {
      setActivityDate(stop.start_date);
    }
    setIsActivityModalOpen(true);
  };

  const handleAddItineraryItem = (e) => {
    e.preventDefault();
    
    let activityIdToSave = '';
    let finalEstCost = 0;

    if (activitySource === 'preset') {
      if (!selectedActivityId) return;
      activityIdToSave = selectedActivityId;
      const act = MASTER_ACTIVITIES.find(a => a.id === selectedActivityId);
      if (act) finalEstCost = act.estimated_cost;
    } else {
      const newActId = 'custom_' + Date.now();
      const newCustomAct = {
        id: newActId,
        city_id: trip.stops.find(s => s.id === selectedStopIdForActivity)?.city_id || '10',
        name: customActivityName,
        description: 'Custom activity',
        activity_type: customActivityType,
        duration_minutes: Number(customActivityDuration),
        estimated_cost: Number(customActivityCost),
        image_url: ''
      };
      MASTER_ACTIVITIES.push(newCustomAct);
      activityIdToSave = newActId;
      finalEstCost = Number(customActivityCost);
    }

    const newItem = {
      id: Date.now().toString(),
      trip_stop_id: selectedStopIdForActivity,
      activity_id: activityIdToSave,
      date: activityDate,
      start_time: activityStartTime,
      end_time: activityEndTime,
      sort_order: (trip.itinerary_items ? trip.itinerary_items.filter(item => item.date === activityDate).length : 0) + 1
    };

    const updatedItems = [...(trip.itinerary_items || []), newItem];
    
    const newExpense = {
      id: 'activity_exp_' + newItem.id,
      trip_id: id,
      trip_stop_id: selectedStopIdForActivity,
      category: 'Activities',
      description: activitySource === 'preset' 
        ? MASTER_ACTIVITIES.find(a => a.id === selectedActivityId)?.name || 'Activity'
        : customActivityName,
      amount: finalEstCost,
      expense_date: activityDate
    };
    
    const updatedExpenses = [...(trip.expenses || []), newExpense];

    saveTripState({ 
      ...trip, 
      itinerary_items: updatedItems,
      expenses: updatedExpenses
    });

    setIsActivityModalOpen(false);
    setSelectedActivityId('');
    setCustomActivityName('');
    setCustomActivityCost('0');
    setCustomActivityDuration('60');
  };

  const handleDeleteItineraryItem = (itemId) => {
    const updatedItems = trip.itinerary_items.filter(item => item.id !== itemId);
    const updatedExpenses = (trip.expenses || []).filter(exp => exp.id !== 'activity_exp_' + itemId);
    saveTripState({ ...trip, itinerary_items: updatedItems, expenses: updatedExpenses });
  };

  // 5. BUDGET OPERATIONS
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

  const filteredCitiesSearch = citiesList.filter(c => 
    c.name.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[90rem] mx-auto px-6 lg:px-12 py-8"> {/* Expanded screen container width */}
      {/* Back Link */}
      <Link to="/trips" className="inline-flex items-center text-base font-bold text-gray-500 hover:text-primary-500 transition-colors mb-6">
        <ArrowLeft className="h-5 w-5 mr-1.5" /> Back to My Trips
      </Link>

      {/* Main Banner Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-amber-500"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{trip.name}</h1>
            <p className="text-gray-550 mt-3 flex items-center text-base font-bold">
              <CalendarIcon className="h-5 w-5 mr-2 text-primary-500" /> {trip.start_date} to {trip.end_date} 
              <span className="ml-3 bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full font-black">
                {diffDays} Days
              </span>
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl p-5 border border-primary-100 flex items-center flex-1 md:flex-none md:min-w-[200px]">
              <IndianRupee className="h-10 w-10 text-primary-600 mr-4 shrink-0" />
              <div>
                <span className="text-xs text-gray-400 font-black uppercase tracking-wider block">Estimated Budget</span>
                <span className="text-2xl font-black text-primary-600">₹{trip.budget.toLocaleString()}</span>
              </div>
            </div>
            {isOverBudget && (
              <div className="bg-red-50 rounded-xl p-5 border border-red-150 flex items-center flex-1 md:flex-none animate-pulse">
                <AlertTriangle className="h-10 w-10 text-red-650 mr-4 shrink-0" />
                <div>
                  <span className="text-xs text-red-500 font-black uppercase tracking-wider block">Warning</span>
                  <span className="text-2xl font-black text-red-650">Over Budget!</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-650 mt-5 leading-relaxed text-base max-w-4xl">{trip.description}</p>
      </div>

      {/* Tabs Layout */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'builder', label: 'Itinerary Builder' },
            { id: 'view', label: 'Itinerary View' },
            { id: 'budget', label: 'Budget & Expenses' },
            { id: 'share', label: 'Share Trip' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-black text-base transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-450 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      
      {/* 1. ITINERARY BUILDER */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Stops Timeline Left (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-4 gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Configure Stops & Timeline</h2>
                <p className="text-sm text-gray-400 mt-1 font-bold">💡 Drag stop cards vertically to rearrange city order</p>
              </div>
              <button
                onClick={() => setIsStopModalOpen(true)}
                className="lg:hidden inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-full shadow text-white bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="h-4.5 w-4.5 mr-1" /> Add Stop
              </button>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-y-2 before:left-[19px] before:w-0.5 before:bg-gradient-to-b before:from-primary-500 before:to-amber-500">
              {(!trip.stops || trip.stops.length === 0) ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 italic shadow-sm ml-6 text-base">
                  No stops added to this trip yet. Use the route planner panel to add your destinations!
                </div>
              ) : (
                trip.stops.map((stop, index) => {
                  const city = citiesList.find(c => c.id === stop.city_id);
                  const stopActivities = trip.itinerary_items 
                    ? trip.itinerary_items.filter(item => item.trip_stop_id === stop.id)
                    : [];

                  return (
                    <div 
                      key={stop.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`relative flex gap-6 items-start transition-all ${
                        draggedIndex === index ? 'opacity-40 scale-98 border-dashed border-2 border-primary-300 rounded-2xl bg-gray-50' : ''
                      }`}
                    >
                      {/* Left Drag indicator pin */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-amber-500 text-white font-black text-sm shrink-0 shadow-md ring-4 ring-white relative z-10 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform" title="Drag to reorder stop">
                        <GripVertical className="h-3.5 w-3.5 shrink-0 text-white/80 absolute left-0.5" />
                        <span className="pl-2">{stop.stop_order}</span>
                      </div>
                      
                      {/* Stop Info Card */}
                      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4 gap-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-950 flex items-center">
                              <MapPin className="h-6 w-6 text-primary-500 mr-2 shrink-0" /> 
                              {city ? `${city.name}, ${city.country}` : 'Custom City'}
                            </h3>
                            <span className="text-sm text-gray-500 font-bold block mt-2 flex items-center">
                              <Clock className="h-4 w-4 mr-1.5" /> {stop.start_date} to {stop.end_date}
                            </span>
                          </div>
                          
                          {/* Trash action */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDeleteStop(stop.id)}
                              className="text-gray-450 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Stop"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Activities Checklist */}
                        <div className="mt-6 border-t border-gray-100 pt-5">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest flex items-center">
                              <CheckSquare className="h-4.5 w-4.5 mr-1.5 text-primary-500" /> Day Activities Checklist
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleOpenActivityModal(stop.id)}
                              className="text-sm text-primary-500 font-bold hover:text-primary-650"
                            >
                              + Add Activity block
                            </button>
                          </div>

                          {stopActivities.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No activity blocks logged for this city. Click "+ Add Activity block" above.</p>
                          ) : (
                            <div className="divide-y divide-gray-50">
                              {stopActivities.map((item) => {
                                const actDetails = MASTER_ACTIVITIES.find(a => a.id === item.activity_id);
                                return (
                                  <div key={item.id} className="py-4 flex justify-between items-center gap-4">
                                    <div className="flex items-start gap-4">
                                      <span className="bg-primary-50 text-primary-600 text-sm font-black px-2.5 py-1 rounded mt-0.5 select-none shrink-0">
                                        {item.start_time}
                                      </span>
                                      <div>
                                        <span className="font-bold text-gray-900 text-base block">
                                          {actDetails ? actDetails.name : 'Custom Activity'}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center gap-3 mt-1 font-semibold">
                                          <span>Date: {item.date}</span>
                                          {actDetails && <span>• Cost: ₹{actDetails.estimated_cost}</span>}
                                          {actDetails && <span>• Type: {actDetails.activity_type}</span>}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteItineraryItem(item.id)}
                                      className="text-gray-400 hover:text-red-655 p-1.5 hover:bg-red-50 rounded"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 md:p-8">
              <h3 className="text-xl font-black text-gray-900 mb-2">Route Planner</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-semibold">
                Add travel stops by selecting preset cities. Drag cards by their numbers on the left to reorder stops interactively!
              </p>
              
              <button
                onClick={() => setIsStopModalOpen(true)}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold rounded-full shadow-md text-base flex items-center justify-center transition-all animate-pulse-slow"
              >
                <Plus className="h-5 w-5 mr-1.5" /> Add New Stop
              </button>

              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="w-full py-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-full text-sm flex items-center justify-center transition-colors"
              >
                <Search className="h-4.5 w-4.5 mr-2" /> Manage Cities Database
              </button>
            </div>

            {/* Quick Summary stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-black text-gray-900 mb-4">Itinerary Summary</h3>
              <div className="space-y-4 text-base font-semibold">
                <div className="flex justify-between py-2.5 border-b border-gray-50 text-gray-655">
                  <span>Planned Stops</span>
                  <span className="font-black text-gray-950">{trip.stops ? trip.stops.length : 0} Cities</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 text-gray-655">
                  <span>Start Date</span>
                  <span className="font-black text-gray-955">{trip.start_date}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-50 text-gray-655">
                  <span>End Date</span>
                  <span className="font-black text-gray-955">{trip.end_date}</span>
                </div>
                <div className="flex justify-between py-2.5 text-gray-655">
                  <span>Total Duration</span>
                  <span className="font-black text-gray-955">{diffDays} Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ITINERARY VIEW (Day-wise Timeline / Calendar View) */}
      {activeTab === 'view' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex justify-between items-center mb-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Review Itinerary Plan</h2>
              <p className="text-sm text-gray-550 mt-1 font-bold">Toggle between day-by-day chronological list and date grid calendar.</p>
            </div>
            
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center px-4 py-2.5 rounded-md text-sm font-bold transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-4.5 w-4.5 mr-1.5" /> List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center px-4 py-2.5 rounded-md text-sm font-bold transition-all ${
                  viewMode === 'calendar' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="h-4.5 w-4.5 mr-1.5" /> Calendar View
              </button>
            </div>
          </div>

          {/* LIST VIEW LAYOUT */}
          {viewMode === 'list' && (
            <div className="space-y-6">
              {tripDateList.map((dateStr, index) => {
                const stopCover = (trip.stops || []).find(s => dateStr >= s.start_date && dateStr <= s.end_date);
                const cityCover = stopCover ? citiesList.find(c => c.id === stopCover.city_id) : null;

                const dayItems = (trip.itinerary_items || [])
                  .filter(item => item.date === dateStr)
                  .sort((a, b) => a.start_time.localeCompare(b.start_time));

                return (
                  <div key={dateStr} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-50 pb-4 mb-5 gap-2">
                      <div className="flex items-center gap-3.5">
                        <span className="bg-gradient-to-br from-primary-500 to-amber-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-sm">
                          Day {index + 1}
                        </span>
                        <h3 className="font-extrabold text-lg text-gray-900">
                          {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h3>
                      </div>
                      
                      {cityCover && (
                        <div className="flex items-center text-xs font-extrabold text-teal-650 bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100/50">
                          <MapPin className="h-4 w-4 mr-1" /> {cityCover.name}, {cityCover.country}
                        </div>
                      )}
                    </div>

                    {dayItems.length === 0 ? (
                      <p className="text-sm text-gray-400 italic py-2">No activities scheduled for this day.</p>
                    ) : (
                      <div className="space-y-4">
                        {dayItems.map((item) => {
                          const act = MASTER_ACTIVITIES.find(a => a.id === item.activity_id);
                          return (
                            <div key={item.id} className="flex flex-col sm:flex-row items-start gap-4 p-5 bg-gray-50/50 rounded-xl border border-gray-100/50 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-2 text-sm font-black text-gray-800 shrink-0">
                                <Clock className="h-5 w-5 text-primary-500" />
                                <span>{item.start_time} - {item.end_time}</span>
                                {act && <span className="text-gray-400">({act.duration_minutes} mins)</span>}
                              </div>

                              <div className="flex-1">
                                <span className="font-bold text-lg text-gray-900 block">
                                  {act ? act.name : 'Custom Activity'}
                                </span>
                                {act && (
                                  <p className="text-sm text-gray-555 mt-1.5 font-bold leading-relaxed">
                                    {act.description}
                                  </p>
                                )}
                              </div>

                              {act && (
                                <div className="flex sm:flex-col items-end gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                  <span className="bg-primary-50 text-primary-750 text-xs px-3 py-1 rounded-full font-black">
                                    {act.activity_type}
                                  </span>
                                  <span className="text-base font-black text-gray-850">
                                    ₹{act.estimated_cost.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* CALENDAR VIEW GRID */}
          {viewMode === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h3 className="font-black text-xl text-gray-900 mb-6">Trip Calendar</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {tripDateList.map((dateStr, index) => {
                    const stopCover = (trip.stops || []).find(s => dateStr >= s.start_date && dateStr <= s.end_date);
                    const cityCover = stopCover ? citiesList.find(c => c.id === stopCover.city_id) : null;
                    const dayItems = (trip.itinerary_items || []).filter(item => item.date === dateStr);
                    const isSelected = selectedCalendarDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedCalendarDate(dateStr)}
                        className={`flex flex-col justify-between p-5 rounded-xl text-left border-2 transition-all min-h-[130px] ${
                          isSelected
                            ? 'bg-primary-50/50 border-primary-500 shadow'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                            isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            Day {index + 1}
                          </span>
                          <span className="text-sm text-gray-400 font-bold mt-0.5">
                            {dateStr.split('-')[2]}
                          </span>
                        </div>

                        {cityCover && (
                          <span className="text-xs font-black text-teal-650 block mt-2 truncate max-w-full">
                            📍 {cityCover.name}
                          </span>
                        )}

                        <div className="mt-3 text-xs font-bold text-gray-455 block">
                          {dayItems.length} {dayItems.length === 1 ? 'Activity' : 'Activities'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                  {selectedCalendarDate ? (
                    <div>
                      <h4 className="font-black text-xl text-gray-900 border-b border-gray-55 pb-2 mb-4">
                        Schedule for {new Date(selectedCalendarDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </h4>
                      
                      {(() => {
                        const dayItems = (trip.itinerary_items || [])
                          .filter(item => item.date === selectedCalendarDate)
                          .sort((a, b) => a.start_time.localeCompare(b.start_time));
                          
                        if (dayItems.length === 0) {
                          return <p className="text-xs text-gray-400 italic">No activity blocks scheduled for this date.</p>;
                        }

                        return (
                          <div className="space-y-4">
                            {dayItems.map(item => {
                              const act = MASTER_ACTIVITIES.find(a => a.id === item.activity_id);
                              return (
                                <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                  <div className="flex justify-between items-start gap-2 mb-2">
                                    <span className="font-extrabold text-base text-gray-900 block truncate leading-tight">
                                      {act ? act.name : 'Custom Activity'}
                                    </span>
                                    <span className="bg-primary-50 text-primary-750 text-[10px] font-extrabold px-2 py-0.5 rounded shrink-0 uppercase">
                                      {item.start_time}
                                    </span>
                                  </div>
                                  {act && (
                                    <div className="flex justify-between text-xs text-gray-500 font-extrabold">
                                      <span>{act.activity_type} ({act.duration_minutes}m)</span>
                                      <span className="text-gray-700">₹{act.estimated_cost}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-450">
                      <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs font-semibold">Select a calendar date to view details.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. BUDGET & EXPENSES */}
      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Row */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-3 gap-4 md:p-8">
              <div className="text-center border-r border-gray-100">
                <span className="text-sm text-gray-400 font-bold uppercase tracking-wider block">Logged Expense</span>
                <span className="text-2xl font-black text-gray-900 block mt-1">₹{totalSpent.toLocaleString()}</span>
              </div>
              <div className="text-center border-r border-gray-100">
                <span className="text-sm text-gray-400 font-bold uppercase tracking-wider block">Remaining</span>
                <span className={`text-2xl font-black block mt-1 ${remaining < 0 ? 'text-red-655 animate-pulse' : 'text-emerald-600'}`}>
                  ₹{remaining.toLocaleString()}
                </span>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-400 font-bold uppercase tracking-wider block">Daily Average</span>
                <span className="text-2xl font-black text-gray-900 block mt-1">
                  ₹{diffDays > 0 ? (totalSpent / diffDays).toFixed(0).toLocaleString() : 0}
                </span>
              </div>
            </div>

            {/* Category spending bar graphs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-black text-gray-900 mb-6">Category Spending Breakdown</h3>
              <div className="space-y-4">
                {categories.map((cat) => {
                  const amt = categoryTotals[cat];
                  const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0;
                  const capPct = Math.min(pct, 100);
                  
                  return (
                    <div key={cat} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold text-gray-550">
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-black text-gray-900 mb-4">Logged Expense Details</h3>
              {(!trip.expenses || trip.expenses.length === 0) ? (
                <p className="text-sm text-gray-500 italic py-4">No expenses logged yet. Log your first expense on the right.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-250 text-left text-base">
                    <thead>
                      <tr className="text-gray-400 uppercase tracking-wider text-[11px] font-black">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold">
                      {trip.expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-gray-50/50">
                          <td className="py-4 px-4 font-bold text-gray-900">{exp.title || exp.description}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              exp.category === 'Transport' ? 'bg-blue-50 text-blue-700 border border-blue-100/50' :
                              exp.category === 'Lodging' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/50' :
                              exp.category === 'Food' ? 'bg-orange-50 text-orange-700 border border-orange-100/50' :
                              exp.category === 'Activities' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-black text-gray-950">₹{exp.amount.toLocaleString()}</td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-gray-400 hover:text-red-655 p-1.5 rounded hover:bg-red-50"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-black text-gray-955 mb-4">Log Expense</h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">Expense Title</label>
                  <input
                    type="text"
                    required
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="e.g. Flight to Paris, Resort deposit"
                    className="w-full px-4 py-3 border border-gray-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-base bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-455 uppercase tracking-wider mb-2">Amount (INR ₹)</label>
                  <input
                    type="number"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full px-4 py-3 border border-gray-255 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-base bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-455 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-255 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-base font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gray-800 hover:bg-gray-900 text-white rounded-full text-base font-extrabold shadow-sm transition-all"
                >
                  Save Logged Expense
                </button>
              </form>
            </div>

            {isOverBudget && (
              <div className="bg-red-50 border border-red-150 rounded-2xl p-6 flex gap-3 text-red-800 shadow-sm animate-pulse">
                <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5 text-red-655" />
                <div>
                  <h4 className="font-extrabold text-base text-red-700">Over-Budget Triggered</h4>
                  <p className="text-sm text-red-600 mt-1 leading-relaxed font-bold">
                    Total expenses have exceeded the trip budget limit by ₹{Math.abs(remaining).toLocaleString()}! Review spent logs.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SHARE TRIP */}
      {activeTab === 'share' && (
        <div className="max-w-3xl bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-gray-905">Share Itinerary</h2>
            <p className="text-base text-gray-500 mt-1.5 font-bold">Generate a public URL to share your itinerary and budget highlights with family or friends.</p>
          </div>

          <div className="flex justify-between items-center py-5 border-t border-b border-gray-100">
            <div>
              <span className="font-bold text-base text-gray-900 block">Make Itinerary Public</span>
              <span className="text-sm text-gray-550 font-bold">Anyone with the link can view (read-only)</span>
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
                    className="flex-1 bg-gray-50 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-600 focus:outline-none cursor-text select-all font-semibold"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-extrabold rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-600 transition-all shrink-0"
                  >
                    {copied ? <ClipboardCheck className="h-5 w-5 mr-2" /> : <Clipboard className="h-5 w-5 mr-2" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-base italic">
              Sharing is disabled. Enable "Make Itinerary Public" to generate the share link.
            </div>
          )}
        </div>
      )}

      {/* MANAGE CITIES DATABASE MODAL */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-gray-900">Manage Cities Database</h3>
                <p className="text-xs text-gray-500 mt-0.5">Search existing destinations or add new ones to your system cities list.</p>
              </div>
              <button onClick={() => setIsCityModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search and Toggle Form bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-50 pb-4">
              <div className="relative w-full sm:max-w-xs text-gray-700">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4.5 w-4.5 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search city by name..."
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:outline-none font-medium"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsAddingCity(!isAddingCity)}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-primary-500 to-amber-500 text-white font-bold text-xs rounded-full shadow"
              >
                {isAddingCity ? 'Cancel' : '+ Add New City to DB'}
              </button>
            </div>

            {/* ADD CITY FORM PANEL */}
            {isAddingCity && (
              <form onSubmit={handleAddCity} className="bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-4 animate-fade-in">
                <h4 className="font-extrabold text-sm text-gray-900">New City Registration Form</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">City Name</label>
                    <input
                      type="text"
                      required
                      value={newCityName}
                      onChange={(e) => setNewCityName(e.target.value)}
                      placeholder="e.g. London"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={newCityCountry}
                      onChange={(e) => setNewCityCountry(e.target.value)}
                      placeholder="e.g. UK"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Region</label>
                    <input
                      type="text"
                      value={newCityRegion}
                      onChange={(e) => setNewCityRegion(e.target.value)}
                      placeholder="e.g. Europe"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cost Index (1-5)</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.5"
                        value={newCityCost}
                        onChange={(e) => setNewCityCost(e.target.value)}
                        className="w-full"
                      />
                      <span className="text-xs font-black text-gray-700 bg-white border px-2 py-0.5 rounded shrink-0">
                        {newCityCost}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Popularity (1-100)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newCityPopularity}
                      onChange={(e) => setNewCityPopularity(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">City Photo URL (Optional)</label>
                    <input
                      type="url"
                      value={newCityImageUrl}
                      onChange={(e) => setNewCityImageUrl(e.target.value)}
                      placeholder="https://images..."
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs bg-white font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-bold shadow"
                  >
                    Register City to Database
                  </button>
                </div>
              </form>
            )}

            {/* CITIES LIST TABLE */}
            <div className="max-h-60 overflow-y-auto border border-gray-150 rounded-xl divide-y divide-gray-100">
              {filteredCitiesSearch.length === 0 ? (
                <p className="text-xs text-gray-400 italic p-6 text-center">No registered cities match your search filter.</p>
              ) : (
                filteredCitiesSearch.map((c) => (
                  <div key={c.id} className="p-3.5 flex justify-between items-center gap-4 hover:bg-gray-50/50">
                    <div className="flex items-center gap-3.5">
                      <img src={c.image_url} alt={c.name} className="w-12 h-12 rounded-lg object-cover border shrink-0" />
                      <div>
                        <span className="font-bold text-sm text-gray-900 block leading-tight">{c.name}, {c.country}</span>
                        {c.region && <span className="text-[10px] text-gray-450 font-bold uppercase tracking-wider">{c.region}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0 text-xs font-extrabold text-gray-500">
                      <span className="flex items-center text-amber-500">
                        <Star className="h-4 w-4 fill-amber-500 mr-1" /> {c.popularity}
                      </span>
                      <span className="flex items-center text-teal-650">
                        <BarChart3 className="h-4 w-4 mr-1" /> Cost: {c.cost_index}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCityModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full text-xs"
              >
                Close Database Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stop Modal Overlay */}
      {isStopModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">Add Stop to Itinerary</h3>
              <button
                onClick={() => setIsStopModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddStop} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-gray-550 uppercase tracking-wider">Destination City</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsStopModalOpen(false);
                      setIsCityModalOpen(true);
                    }}
                    className="text-[10px] text-primary-500 font-bold hover:underline"
                  >
                    + Add New City option
                  </button>
                </div>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold"
                >
                  {citiesList.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-555 uppercase tracking-wider mb-1.5">Arrival Date</label>
                  <input
                    type="date"
                    required
                    value={stopStartDate}
                    onChange={(e) => setStopStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-555 uppercase tracking-wider mb-1.5">Departure Date</label>
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
                  className="px-5 py-2.5 border border-gray-350 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 border border-transparent rounded-lg text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 shadow shadow-primary-500/10"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Itinerary Item Modal Overlay */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">Schedule Day Activity</h3>
              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddItineraryItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-555 uppercase tracking-wider mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={activityDate}
                  min={trip.stops.find(s => s.id === selectedStopIdForActivity)?.start_date}
                  max={trip.stops.find(s => s.id === selectedStopIdForActivity)?.end_date}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
                />
              </div>

              <div className="flex gap-4 border-b border-gray-100 pb-3">
                <label className="inline-flex items-center text-sm font-bold text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    value="preset"
                    checked={activitySource === 'preset'}
                    onChange={() => setActivitySource('preset')}
                    className="mr-2"
                  />
                  Preset Suggestion
                </label>
                <label className="inline-flex items-center text-sm font-bold text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    value="custom"
                    checked={activitySource === 'custom'}
                    onChange={() => setActivitySource('custom')}
                    className="mr-2"
                  />
                  Custom Activity
                </label>
              </div>

              {activitySource === 'preset' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-555 uppercase tracking-wider mb-1.5">Select Preset Activity</label>
                  <select
                    required={activitySource === 'preset'}
                    value={selectedActivityId}
                    onChange={(e) => setSelectedActivityId(e.target.value)}
                    className="w-full px-3.5 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none text-sm font-semibold"
                  >
                    <option value="">-- Choose Activity --</option>
                    {MASTER_ACTIVITIES.filter(act => act.city_id === trip.stops.find(s => s.id === selectedStopIdForActivity)?.city_id).map((act) => (
                      <option key={act.id} value={act.id}>
                        {act.name} (Est. Cost: ₹{act.estimated_cost})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-555 uppercase tracking-wider mb-1">Activity Name</label>
                    <input
                      type="text"
                      required={activitySource === 'custom'}
                      value={customActivityName}
                      onChange={(e) => setCustomActivityName(e.target.value)}
                      placeholder="e.g. Scuba diving, Museum tour"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                      <select
                        value={customActivityType}
                        onChange={(e) => setCustomActivityType(e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
                      >
                        {['Sightseeing', 'Culture', 'Leisure', 'Adventure', 'Beach', 'History'].map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cost (INR)</label>
                      <input
                        type="number"
                        value={customActivityCost}
                        onChange={(e) => setCustomActivityCost(e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Duration (Min)</label>
                      <input
                        type="number"
                        value={customActivityDuration}
                        onChange={(e) => setCustomActivityDuration(e.target.value)}
                        className="w-full px-2 py-2 border border-gray-350 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-555 uppercase tracking-wider mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={activityStartTime}
                    onChange={(e) => setActivityStartTime(e.target.value)}
                    className="w-full px-3.5 py-3 border border-gray-300 rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-555 uppercase tracking-wider mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={activityEndTime}
                    onChange={(e) => setActivityEndTime(e.target.value)}
                    className="w-full px-3.5 py-3 border border-gray-300 rounded-lg text-sm bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-350 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 border border-transparent rounded-lg text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 shadow shadow-primary-500/10"
                >
                  Schedule Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
