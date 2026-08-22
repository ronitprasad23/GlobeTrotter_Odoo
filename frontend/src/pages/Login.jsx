import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation States
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Basic real-world validation
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      // Save mock login state
      localStorage.setItem('globetrotter_auth', JSON.stringify({ email, isLoggedIn: true }));
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel: Aesthetic Travel Promotion (Visible on Laptops/Desktops) */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: 'linear-gradient(rgba(15, 118, 110, 0.45), rgba(15, 118, 110, 0.45)), url("https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1200&auto=format&fit=crop&q=80")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-950/80"></div>
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center text-white">
            <Compass className="h-10 w-10 text-primary-500 animate-spin-slow mr-3 shrink-0" />
            <span className="font-extrabold text-3xl tracking-tight">GlobeTrotter</span>
          </Link>
          
          <div className="space-y-6 max-w-lg">
            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Your Next Journey Starts Here. 🗺️
            </h2>
            <p className="text-lg text-teal-50 font-semibold leading-relaxed">
              Design customized multi-city itineraries, manage durations, track category budgets, and share itineraries with friends.
            </p>
          </div>
          
          <span className="text-sm text-teal-200 font-bold">
            &copy; {new Date().getFullYear()} GlobeTrotter. All rights reserved.
          </span>
        </div>
      </div>

      {/* Right Panel: Clean Big Form (Visible on all devices) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-gray-50/50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-amber-500"></div>

          {/* Mobile Logo Brand */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Compass className="h-9 w-9 text-primary-500 mr-2 shrink-0 animate-spin-slow" />
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary-500 to-amber-500 bg-clip-text text-transparent">
              GlobeTrotter
            </span>
          </div>

          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back!</h2>
            <p className="text-gray-500 mt-2 text-sm font-semibold">Sign in to access your planned trips and budgets.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-150 rounded-xl p-4 flex gap-3 text-red-800 animate-pulse">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-650" />
              <span className="text-xs font-bold leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                <a href="#forgot" className="text-xs font-bold text-primary-500 hover:text-primary-600">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white font-medium"
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

            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-655 font-bold cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold rounded-full shadow shadow-primary-500/20 text-sm flex items-center justify-center transition-all disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-semibold text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-500 hover:text-primary-600">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
