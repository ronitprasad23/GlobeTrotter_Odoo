import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, saveUserProfile, getCities } from '../utils/storage';
import { 
  User, Settings, Shield, Globe, Star, BarChart3, Trash2, Heart, Search, Save, CheckCircle
} from 'lucide-react';
import Avatar, { normalizeImageUrl } from '../components/Avatar';

export default function Profile() {
  const navigate = useNavigate();
  const authData = JSON.parse(localStorage.getItem('globetrotter_auth') || '{}');
  const isLoggedIn = !!authData.isLoggedIn;

  const [profile, setProfile] = useState(null);
  const [citiesList, setCitiesList] = useState([]);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [language, setLanguage] = useState('English');
  const [savedSearchQuery, setSavedSearchQuery] = useState('');
  
  // Feedback status
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [bookmarkSearchQuery, setBookmarkSearchQuery] = useState('');
  const [showBookmarkDropdown, setShowBookmarkDropdown] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const activeProfile = getUserProfile();
    if (activeProfile) {
      const mergedProfile = {
        ...activeProfile,
        name: authData.name || activeProfile.name,
        email: authData.email || activeProfile.email,
        photo_url: authData.profile_image || activeProfile.photo_url
      };
      setProfile(mergedProfile);
      setName(mergedProfile.name);
      setEmail(mergedProfile.email);
      setPhotoUrl(mergedProfile.photo_url || '');
      setLanguage(mergedProfile.language || 'English');
    }
    setCitiesList(getCities());
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn || !profile) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const normalizedUrl = normalizeImageUrl(photoUrl);

    // Call backend API if user is authenticated with backend
    if (authData.token) {
      fetch('http://127.0.0.1:8000/api/auth/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        },
        body: JSON.stringify({
          name,
          email,
          profile_image: normalizedUrl
        })
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update profile on server');
        return res.json();
      })
      .then(data => {
        console.log('Profile updated in backend:', data);
      })
      .catch(err => console.error(err));
    }

    const updated = {
      ...profile,
      name,
      email,
      photo_url: normalizedUrl,
      language
    };
    saveUserProfile(updated);
    setProfile(updated);
    setPhotoUrl(normalizedUrl);
    
    // Sync back to authData
    const updatedAuth = { ...authData, name, email, profile_image: normalizedUrl };
    localStorage.setItem('globetrotter_auth', JSON.stringify(updatedAuth));

    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('⚠️ WARNING: Deleting your account will completely reset the application database and clear all trip itineraries, stops, and settings. This cannot be undone. Proceed?')) {
      localStorage.clear();
      alert('Your account and local storage database have been cleared. Redirecting to home...');
      window.location.href = '/';
    }
  };

  const handleRemoveDestination = (cityId) => {
    const updatedDestinations = (profile.saved_destinations || []).filter(id => id !== cityId);
    const updated = { ...profile, saved_destinations: updatedDestinations };
    saveUserProfile(updated);
    setProfile(updated);
  };

  const handleAddBookmark = (cityId) => {
    if ((profile.saved_destinations || []).includes(cityId)) return;
    const updatedDestinations = [...(profile.saved_destinations || []), cityId];
    const updated = { ...profile, saved_destinations: updatedDestinations };
    saveUserProfile(updated);
    setProfile(updated);
    setBookmarkSearchQuery('');
    setShowBookmarkDropdown(false);
  };

  // Get matching cities for saved list
  const savedCities = citiesList.filter(c => (profile.saved_destinations || []).includes(c.id));
  const filteredSavedCities = savedCities.filter(c => 
    c.name.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(savedSearchQuery.toLowerCase())
  );

  // Get candidate cities to add as bookmark
  const unbookmarkedCities = citiesList.filter(c => !(profile.saved_destinations || []).includes(c.id));
  const filteredBookmarksToAdd = unbookmarkedCities.filter(c => 
    c.name.toLowerCase().includes(bookmarkSearchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(bookmarkSearchQuery.toLowerCase())
  );

  return (
    <div className="w-full py-2">
      <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-8">User Profile & Settings</h1>
          {isSavedAlert && (
        <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 mb-6 flex items-center gap-3 text-emerald-800 animate-fade-in">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-bold">Profile settings saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Profile Summary & Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative shrink-0">
              <Avatar 
                src={photoUrl} 
                name={name} 
                className="w-28 h-28 border-4 border-primary-50 ring-4 ring-primary-500/20"
                textClassName="text-4xl"
              />
              <div className="absolute bottom-0 right-0 bg-primary-500 text-white p-1.5 rounded-full shadow border-2 border-white">
                <Settings className="h-4.5 w-4.5" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black text-gray-900">{name}</h2>
              <span className="text-base text-gray-500 font-bold block mt-1">{email}</span>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-xs font-black text-gray-450 uppercase tracking-wider">
                <span className="bg-gray-100 px-3 py-1 rounded-full">Joined: {profile.joined || 'August 2026'}</span>
                <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full flex items-center">
                  <Globe className="h-3.5 w-3.5 mr-1" /> Lang: {language}
                </span>
              </div>
            </div>
          </div>

          {/* EDIT FORM CARD */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <h3 className="text-xl font-black text-gray-900 border-b border-gray-150 pb-3 mb-6 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-500" /> Account Settings
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-base bg-white font-semibold text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-base bg-white font-semibold text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">Profile Photo URL</label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-base bg-white font-semibold text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-455 uppercase tracking-wider mb-2">Language Preference</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-base font-semibold text-gray-800"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Español (Spanish)</option>
                    <option value="French">Français (French)</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100 gap-4">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded-xl text-sm transition-colors flex items-center"
                >
                  <Shield className="h-4.5 w-4.5 mr-1.5" /> Reset Database / Delete Account
                </button>

                <button
                  type="submit"
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white font-black rounded-xl text-sm transition-colors flex items-center shadow-sm"
                >
                  <Save className="h-4.5 w-4.5 mr-1.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Saved Destinations Catalog */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-gray-900 flex items-center">
                <Heart className="h-5.5 w-5.5 mr-2 text-red-500 fill-red-500" /> Saved Cities
              </h3>
            </div>
            
            <p className="text-sm text-gray-500 font-semibold mb-6">
              Bookmark cities you want to visit so you can easily include them in new itineraries.
            </p>

            {/* Quick search and bookmark dropdown selector */}
            <div className="relative mb-6 text-gray-700">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Search className="h-4.5 w-4.5 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Bookmark new city..."
                  value={bookmarkSearchQuery}
                  onFocus={() => setShowBookmarkDropdown(true)}
                  onChange={(e) => {
                    setBookmarkSearchQuery(e.target.value);
                    setShowBookmarkDropdown(true);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:outline-none"
                />
                {bookmarkSearchQuery && (
                  <button 
                    onClick={() => {
                      setBookmarkSearchQuery('');
                      setShowBookmarkDropdown(false);
                    }} 
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    &times;
                  </button>
                )}
              </div>

              {showBookmarkDropdown && bookmarkSearchQuery && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-15 divide-y divide-gray-50">
                  {filteredBookmarksToAdd.length === 0 ? (
                    <div className="p-3 text-xs text-gray-400 italic">No cities match or already bookmarked.</div>
                  ) : (
                    filteredBookmarksToAdd.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleAddBookmark(c.id)}
                        className="w-full p-2.5 text-left text-xs hover:bg-primary-50 hover:text-primary-700 font-bold flex justify-between items-center"
                      >
                        <span>{c.name}, {c.country}</span>
                        <span className="text-[9px] uppercase tracking-wider text-gray-400">{c.region}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* List Search query input */}
            <div className="relative mb-6 text-gray-700">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search saved list..."
                value={savedSearchQuery}
                onChange={(e) => setSavedSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-250 rounded-xl text-xs bg-white focus:outline-none font-medium"
              />
            </div>

            {/* List of saved destinations */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {filteredSavedCities.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-6">No saved destinations match your search.</p>
              ) : (
                filteredSavedCities.map((c) => (
                  <div key={c.id} className="border border-gray-150 rounded-xl overflow-hidden flex flex-col hover:shadow-xs transition-shadow bg-white">
                    <div className="h-28 w-full overflow-hidden relative">
                      <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveDestination(c.id)}
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-red-500 hover:text-red-700 p-2 rounded-full shadow-sm hover:scale-105 transition-all"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <span className="absolute bottom-2 left-3 font-bold text-white text-sm">{c.name}, {c.country}</span>
                    </div>

                    <div className="p-3.5 flex justify-between items-center text-[10px] font-extrabold text-gray-500">
                      <span className="flex items-center text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-500 mr-1" /> {c.popularity} Pop
                      </span>
                      <span className="flex items-center text-teal-650">
                        <BarChart3 className="h-3.5 w-3.5 mr-1" /> Cost: {c.cost_index}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
