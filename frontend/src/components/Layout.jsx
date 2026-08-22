import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  const location = useLocation();
  const isFullWidthPage = 
    location.pathname === '/' || 
    location.pathname === '/login' || 
    location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />
        {isFullWidthPage ? (
          <main>
            <Outlet />
          </main>
        ) : (
          <main className="py-8">
            <div className="app-container">
              <Outlet />
            </div>
          </main>
        )}
      </div>
      <footer className="bg-white border-t border-gray-250 py-6 mt-8">
        <div className="app-container text-center text-sm text-gray-500 font-semibold">
          &copy; {new Date().getFullYear()} GlobeTrotter. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
