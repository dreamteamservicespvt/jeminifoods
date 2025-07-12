import { useState, useCallback, useEffect } from 'react';
import { useUserAuth } from '../contexts/UserAuthContext';
import { collection, getDocs, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from '../hooks/use-toast';

export interface Reservation {
  id: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
  tableLocation?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: any;
}

export interface PreOrder {
  id: string;
  items: any[];
  total: number;
  status: 'pending' | 'booked' | 'taken' | 'making' | 'ready' | 'completed';
  date: string; // Changed from pickupDate to match actual data
  time: string; // Changed from pickupTime to match actual data
  createdAt: any;
  assignedChef?: string;
  estimatedReadyTime?: string;
  orderId?: string;
  name?: string;
  phone?: string;
  specialRequests?: string;
  paymentStatus?: 'pending' | 'completed';
  estimatedPickupTime?: string;
}

export interface Favorite {
  id: string;
  itemId: string;
  itemType: 'menuItem' | 'gallery';
  name: string;
  description: string;
  imageUrl: string;
  createdAt: any;
}

export const useDashboardData = (realtime = false) => {
  const { user } = useUserAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchUserData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      
      // Fetch reservations
      const reservationsQuery = query(
        collection(db, 'reservations'),
        where('userId', '==', user.uid)
      );
      
      const reservationsSnapshot = await getDocs(reservationsQuery);
      const reservationsData = reservationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[];
      
      // Fetch pre-orders
      const preOrdersQuery = query(
        collection(db, 'preOrders'),
        where('userId', '==', user.uid)
      );
      
      const preOrdersSnapshot = await getDocs(preOrdersQuery);
      const preOrdersData = preOrdersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PreOrder[];
      
      // Fetch favorites
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', user.uid)
      );
      
      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favoritesData = favoritesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Favorite[];
      
      setReservations(reservationsData);
      setPreOrders(preOrdersData);
      setFavorites(favoritesData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error loading data",
        description: "Could not load your reservations and pre-orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const refreshData = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
    
    toast({
      title: "Data refreshed",
      description: "Your reservations and pre-orders have been updated",
      variant: "default",
    });
  }, [fetchUserData, refreshing, toast]);

  useEffect(() => {
    if (!user?.uid) return;
    
    if (realtime) {
      // Set up real-time listeners
      const reservationsQuery = query(
        collection(db, 'reservations'),
        where('userId', '==', user.uid)
      );
      
      const preOrdersQuery = query(
        collection(db, 'preOrders'),
        where('userId', '==', user.uid)
      );
      
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', user.uid)
      );
      
      const reservationsUnsubscribe = onSnapshot(reservationsQuery, (snapshot) => {
        const reservationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Reservation[];
        
        setReservations(reservationsData);
      });
      
      const preOrdersUnsubscribe = onSnapshot(preOrdersQuery, (snapshot) => {
        const preOrdersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PreOrder[];
        
        setPreOrders(preOrdersData);
      });
      
      const favoritesUnsubscribe = onSnapshot(favoritesQuery, (snapshot) => {
        const favoritesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Favorite[];
        
        setFavorites(favoritesData);
      });
      
      setLoading(false);
      
      return () => {
        reservationsUnsubscribe();
        preOrdersUnsubscribe();
        favoritesUnsubscribe();
      };
    } else {
      // Just fetch once
      fetchUserData();
    }
  }, [user, fetchUserData, realtime]);

  return {
    reservations,
    preOrders,
    favorites,
    loading,
    refreshing,
    refreshData
  };
};

export default useDashboardData;
