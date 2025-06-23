import { useState, useEffect } from 'react';
import { useUserAuth } from '../contexts/UserAuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from './use-toast';

export interface Favorite {
  id: string;
  itemId: string;
  itemType: 'menuItem' | 'gallery';
  name: string;
  description: string;
  imageUrl: string;
  userId: string;
  createdAt: any;
}

export function useFavorites() {
  const { user } = useUserAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const favItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Favorite[];
        
        setFavorites(favItems);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const addFavorite = async (item: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    type: 'menuItem' | 'gallery';
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Check if already a favorite
      const exists = favorites.some(fav => fav.itemId === item.id && fav.itemType === item.type);
      
      if (exists) {
        toast({
          title: "Already in favorites",
          description: `This ${item.type === 'menuItem' ? 'menu item' : 'gallery item'} is already in your favorites`,
        });
        return false;
      }
      
      // Add to favorites collection
      const favoriteData = {
        userId: user.uid,
        itemId: item.id,
        itemType: item.type,
        name: item.name,
        description: item.description || '',
        imageUrl: item.imageUrl || '',
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'favorites'), favoriteData);
      
      // Update local state
      setFavorites(prev => [
        { id: docRef.id, ...favoriteData },
        ...prev
      ]);
      
      toast({
        title: "Added to favorites",
        description: `${item.name} has been added to your favorites`,
      });
      
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast({
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    if (!user) return false;
    
    try {
      await deleteDoc(doc(db, 'favorites', favoriteId));
      
      // Update local state
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      
      toast({
        title: "Removed from favorites",
        description: "Item has been removed from your favorites",
      });
      
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const isFavorite = (itemId: string, type: 'menuItem' | 'gallery') => {
    return favorites.some(fav => fav.itemId === itemId && fav.itemType === type);
  };

  const getFavoriteId = (itemId: string, type: 'menuItem' | 'gallery') => {
    const favorite = favorites.find(fav => fav.itemId === itemId && fav.itemType === type);
    return favorite?.id;
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavoriteId
  };
}
