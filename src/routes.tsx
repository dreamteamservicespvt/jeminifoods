import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';

// Import all pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Gallery from "./pages/Gallery";
import Reservations from "./pages/Reservations";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from "./pages/NotFound";
import PreOrders from "./pages/PreOrders";

// Import components
import Navigation from './components/Navigation';
import Footer from './components/Footer';

const AppRoutes = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-amber-400 text-2xl font-serif">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Admin routes without TitleBar */}
      <Route path="/admin" element={
        user ? <AdminDashboard /> : <AdminLogin />
      } />
      
      {/* Authentication routes without TitleBar and Navigation */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
        {/* Public routes with Navigation only */}
      <Route path="/*" element={
        <>
          <Navigation />
          <div className="pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/preorders" element={<PreOrders />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </>
      } />
    </Routes>
  );
};

export default AppRoutes;