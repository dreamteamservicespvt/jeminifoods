import { useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from './routes';
import { NotificationProvider } from './contexts/NotificationContext';
import { MultiAuthProvider } from './contexts/MultiAuthContext';
import { CartProvider } from './contexts/CartContext';
import LoadingScreen from './components/LoadingScreen';
import { PersistentCartIcon } from './components/PersistentCart';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

// ScrollToTop component to handle scroll restoration
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const App = () => {
  const [loadingComplete, setLoadingComplete] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MultiAuthProvider>
          <CartProvider>
            <NotificationProvider>
              <div className="relative min-h-screen bg-charcoal text-cream">
                <ScrollToTop />
                <Toaster />
                <Sonner />
                {loadingComplete ? (
                  <div className="main-content">
                    <AppRoutes />
                    <PersistentCartIcon />
                  </div>
                ) : (
                  <LoadingScreen onComplete={() => setLoadingComplete(true)} />
                )}
              </div>
            </NotificationProvider>
          </CartProvider>
        </MultiAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
