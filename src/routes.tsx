import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useUserAuthOnly } from './contexts/MultiAuthContext';

// Import all pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Gallery from "./pages/Gallery.tsx";
import Reservations from "./pages/Reservations";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import MyOrders from "./pages/MyOrders";
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ChefLogin from './pages/chef/ChefLogin';
import ChefDashboard from './pages/chef/ChefDashboard';
import NotFound from "./pages/NotFound";
import PreOrders from "./pages/PreOrders";
import MultiSessionDemo from "./pages/MultiSessionDemo";
import Excellence from "./pages/Excellence";
import Cuisine from "./pages/Cuisine";
import ExperiencePage from "./pages/Experience";

// Import components
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

const AppRoutes = () => {
  const { user, loading } = useUserAuthOnly();


  return (
    <Routes>
      {/* Admin routes - PROTECTED with proper authentication */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      } />
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      } />
      
      {/* Chef routes without TitleBar */}
      <Route path="/chef/login" element={<ChefLogin />} />
      <Route path="/chef/dashboard" element={<ChefDashboard />} />
      <Route path="/chef" element={
        user ? <ChefDashboard /> : <ChefLogin />
      } />
      
      {/* Authentication routes without TitleBar and Navigation */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Public routes with Navigation only */}
      <Route path="/*" element={
        <>
          <Navigation />
          <div className="pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/reservations" element={<Reservations />} />              <Route path="/preorders" element={<PreOrders />} />
              <Route path="/pre-orders" element={<PreOrders />} />
              <Route path="/my-orders" element={<MyOrders />} /><Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/multi-session-demo" element={<MultiSessionDemo />} />
              <Route path="/excellence" element={<Excellence />} />
              <Route path="/cuisine" element={<Cuisine />} />
              <Route path="/experience" element={<ExperiencePage />} />
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