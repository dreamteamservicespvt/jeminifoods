import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MenuItem } from '../contexts/CartContext';

export const useMenuData = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'menuItems'),
      (snapshot) => {
        const items = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as MenuItem))
          .filter(item => item.visibility !== false);
        setMenuItems(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching menu items:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    menuItems,
    loading
  };
};
