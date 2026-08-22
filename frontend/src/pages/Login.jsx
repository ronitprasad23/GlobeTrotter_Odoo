import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
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
    
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('globetrotter_auth', JSON.stringify({ email, isLoggedIn: true }));
      navigate('/');
    }, 1000);
  };

  return (
    <div 
      className="min-h-[90vh] w-full flex items-center justify-center bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{ backgroundImage: 'linear-gradient(rgba(15, 118, 110, 0.4), rgba(15, 118, 110, 0.4)), url("https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1600&auto=format&fit=crop&q=80")' }}
    >
      {/* Centered Floating Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 md:p-12 relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-amber-500"></div>

        {/* Brand logo */}
        <div className="flex items-center justify-center mb-6">
          <Compass className="h-9 w-9 text-primary-500 mr-2 shrink-0 animate-spin-slow" />
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary-500 to-amber-500 bg-clip-text text-transparent">
            GlobeTrotter
          </span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back!</h2>
          <p className="text-sm text-gray-500 mt-2 font-bold">Sign in to access your planned trips and budgets.</p>
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
              <a href="#forgot" className="text-xs font-bold text-primary-500 hover:text-primary-650">Forgot password?</a>
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
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-455 hover:text-gray-700"
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
          <Link to="/signup" className="text-primary-500 hover:text-primary-600 font-bold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
