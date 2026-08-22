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
    <div className="min-h-screen bg-gray-50">
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
  );
}
