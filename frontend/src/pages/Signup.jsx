import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTrips, saveTrips } from '../utils/storage';
import { Compass, Eye, EyeOff, Mail, Lock, User, Image, AlertCircle } from 'lucide-react';

const PRESET_AVATARS = [
  { name: 'Backpacker', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Explorer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Camper', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { name: 'Pilot', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' }
];

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(PRESET_AVATARS[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const finalProfileImage = customImageUrl.trim() || profileImage;

    setTimeout(() => {
      setIsLoading(false);
      const newUser = {
        name,
        email,
        profile_image: finalProfileImage,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('globetrotter_auth', JSON.stringify({ ...newUser, isLoggedIn: true }));
      navigate('/');
    }, 1000);
  };

  return (
    <div 
      className="min-h-[90vh] w-full flex items-center justify-center bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{ backgroundImage: 'linear-gradient(rgba(15, 118, 110, 0.4), rgba(15, 118, 110, 0.4)), url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80")' }}
    >
      {/* Centered Floating Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 md:p-12 relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-amber-500"></div>

        {/* Brand logo */}
        <div className="flex items-center justify-center mb-6">
          <Compass className="h-9 w-9 text-primary-500 mr-2 shrink-0 animate-spin-slow" />
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary-500 to-amber-500 bg-clip-text text-transparent">
            GlobeTrotter
          </span>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h2>
          <p className="text-sm text-gray-500 mt-2 font-bold">Join GlobeTrotter to map itineraries and track costs.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-150 rounded-xl p-4 flex gap-3 text-red-800 animate-pulse">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-650" />
            <span className="text-xs font-bold leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                required
                placeholder="Zara Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="email"
                required
                placeholder="zara.smith@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-450 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-255 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-450 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Choose Travel Avatar</label>
            <div className="flex justify-between items-center gap-3 mb-3">
              {PRESET_AVATARS.map((avatar) => (
                <button
                  key={avatar.name}
                  type="button"
                  onClick={() => {
                    setProfileImage(avatar.url);
                    setCustomImageUrl('');
                  }}
                  className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                    profileImage === avatar.url && !customImageUrl
                      ? 'border-primary-500 scale-105 shadow-sm shadow-primary-500/20' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Image className="h-4 w-4 text-gray-400" />
              </span>
              <input
                type="url"
                placeholder="Or paste custom image URL..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-xs bg-white font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold rounded-full shadow shadow-primary-500/20 text-sm flex items-center justify-center transition-all disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-semibold text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 hover:text-primary-600 font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
