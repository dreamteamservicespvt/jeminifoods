import { useState, useEffect } from 'react';
import { useResponsiveContext } from '@/contexts/ResponsiveContext';

type ScrollState = {
  scrollY: number;
  scrollX: number;
  scrollDirection: 'up' | 'down' | 'none';
  isScrolled: boolean;
  scrollPercent: number;
  isAtTop: boolean;
  isAtBottom: boolean;
};

/**
 * Custom hook that combines responsive state with scroll information
 * Useful for implementing scroll-triggered animations and behaviors
 */
export const useResponsiveScroll = (scrollThreshold = 50): ScrollState & { isSmallScreen: boolean } => {
  const responsive = useResponsiveContext();
  
  // Default scroll state
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
    scrollX: typeof window !== 'undefined' ? window.scrollX : 0,
    scrollDirection: 'none',
    isScrolled: false,
    scrollPercent: 0,
    isAtTop: true,
    isAtBottom: false,
  });
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentScrollX = window.scrollX;
      const direction = currentScrollY > lastScrollY ? 'down' : 
                        currentScrollY < lastScrollY ? 'up' : 'none';
      
      // Calculate scroll position as percentage
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollHeight > 0 ? (currentScrollY / scrollHeight) * 100 : 0;
      
      setScrollState({
        scrollY: currentScrollY,
        scrollX: currentScrollX,
        scrollDirection: direction,
        isScrolled: currentScrollY > scrollThreshold,
        scrollPercent,
        isAtTop: currentScrollY <= 5, // Small threshold to account for bounce effects
        isAtBottom: scrollPercent >= 99, // 99% instead of 100% to account for rounding errors
      });
      
      lastScrollY = currentScrollY;
    };
    
    // Initial check
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollThreshold]);
  
  // Combine responsive and scroll state
  return {
    ...scrollState,
    isSmallScreen: responsive.isMobile || responsive.isTablet,
  };
};

export default useResponsiveScroll;
