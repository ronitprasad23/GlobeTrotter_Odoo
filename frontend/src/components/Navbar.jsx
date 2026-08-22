import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Menu, X, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const authData = JSON.parse(localStorage.getItem('globetrotter_auth') || '{}');
  const isLoggedIn = !!authData.isLoggedIn;

  const handleLogout = () => {
    localStorage.removeItem('globetrotter_auth');
    setIsOpen(false);
    navigate('/login');
  };

  const navLinks = isLoggedIn
    ? [
        { name: 'Dashboard', path: '/' },
        { name: 'My Trips', path: '/trips' },
        { name: 'Profile', path: '/profile' }
      ]
    : [{ name: 'Dashboard', path: '/' }];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="app-container">
        <div className="flex justify-between h-20">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Compass className="h-9 w-9 text-primary-500 mr-2 shrink-0 animate-spin-slow" />
              <span className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-primary-500 to-amber-500 bg-clip-text text-transparent">
                GlobeTrotter
              </span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-base font-bold transition-colors ${
                    isActive(link.path)
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-6">
            {isLoggedIn ? (
              <>
                <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                  {authData.profile_image ? (
                    <img
                      src={authData.profile_image}
                      alt={authData.name}
                      className="h-8 w-8 rounded-full object-cover border border-primary-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <UserIcon className="h-4.5 w-4.5" />
                    </div>
                  )}
                  <span className="text-sm font-bold text-gray-700">{authData.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center text-base font-bold text-gray-550 hover:text-red-650 transition-colors cursor-pointer"
                >
                  <LogOut className="h-5 w-5 mr-1.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-base font-bold text-gray-550 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-extrabold rounded-full shadow-md text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 hover:shadow-lg transition-all"
                >
                  Start Planning
                </Link>
              </>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden bg-white border-b border-gray-150 animate-fade-in">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block pl-3 pr-4 py-2.5 border-l-4 text-base font-bold transition-all ${
                  isActive(link.path)
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-4 border-t border-gray-100 px-4 space-y-2">
            {isLoggedIn ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-2">
                  {authData.profile_image ? (
                    <img
                      src={authData.profile_image}
                      alt={authData.name}
                      className="h-9 w-9 rounded-full object-cover border border-primary-200"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <UserIcon className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-gray-800">{authData.name}</div>
                    <div className="text-xs font-semibold text-gray-400">{authData.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="block text-center w-full px-4 py-2.5 border border-red-200 rounded-full text-base font-bold text-red-650 bg-white hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full px-4 py-2.5 border border-gray-300 rounded-full text-base font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full px-4 py-2.5 border border-transparent rounded-full text-base font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow"
                >
                  Start Planning
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
