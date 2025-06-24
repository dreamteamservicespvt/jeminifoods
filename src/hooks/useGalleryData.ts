import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GalleryItem } from '../types/gallery';
import { useToast } from './use-toast';

export interface UseGalleryDataReturn {
  galleryItems: GalleryItem[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
  trackImageView: (itemId: string) => Promise<void>;
}

export const useGalleryData = (realtime = true): UseGalleryDataReturn => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGalleryData = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      // Create query to get gallery items sorted by newest first
      const galleryQuery = query(
        collection(db, 'gallery'),
        orderBy('uploadedAt', 'desc')
      );

      if (realtime) {
        // Set up real-time listener
        const unsubscribe = onSnapshot(
          galleryQuery,
          (snapshot) => {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
            })) as GalleryItem[];

            setGalleryItems(items);
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching gallery items:', error);
            setError('Failed to load gallery images');
            setLoading(false);
            
            toast({
              title: "Error",
              description: "Failed to load gallery images. Please try again.",
              variant: "destructive"
            });
          }
        );

        return unsubscribe;
      }
    } catch (error) {
      console.error('Error setting up gallery data:', error);
      setError('Failed to initialize gallery');
      setLoading(false);
      
      toast({
        title: "Error",
        description: "Failed to initialize gallery. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, [realtime, toast]);

  // Manual refresh function
  const refreshData = useCallback(() => {
    fetchGalleryData();
  }, [fetchGalleryData]);

  // Track image view (increment view count)
  const trackImageView = useCallback(async (itemId: string) => {
    try {
      await updateDoc(doc(db, 'gallery', itemId), {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error tracking image view:', error);
      // Silently fail for view tracking
    }
  }, []);

  useEffect(() => {
    const unsubscribe = fetchGalleryData();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [fetchGalleryData]);

  return {
    galleryItems,
    loading,
    error,
    refreshData,
    trackImageView
  };
};

export default useGalleryData;
