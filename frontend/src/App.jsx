import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import TripDetails from './pages/TripDetails';
import Profile from './pages/Profile';
import PublicTripView from './pages/PublicTripView';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="trips" element={<MyTrips />} />
          <Route path="trips/create" element={<CreateTrip />} />
          <Route path="trips/:id" element={<TripDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="share/:id" element={<PublicTripView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
