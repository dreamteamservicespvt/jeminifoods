import React from 'react';
import { useResponsiveContext } from '@/contexts/ResponsiveContext';
import { Breakpoint, BREAKPOINTS } from '@/hooks/useResponsive';

interface ResponsiveDebugProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetails?: boolean;
}

/**
 * A component that displays the current breakpoint and responsive information
 * Useful for debugging responsive layouts
 * Only use this in development mode
 */
export const ResponsiveDebug: React.FC<ResponsiveDebugProps> = ({ 
  position = 'bottom-right',
  showDetails = false
}) => {
  const responsive = useResponsiveContext();
  const { activeBreakpoint, width, height, orientation } = responsive;
  
  // Don't render in production
  if (process.env.NODE_ENV === 'production') return null;
  
  // Position classes
  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  }[position];
  
  // Color based on breakpoint
  const colorClasses = {
    'xs': 'bg-red-500 text-white',
    'sm': 'bg-orange-500 text-white',
    'md': 'bg-yellow-500 text-black',
    'lg': 'bg-green-500 text-white',
    'xl': 'bg-blue-500 text-white',
    '2xl': 'bg-purple-500 text-white',
  }[activeBreakpoint] || 'bg-gray-500 text-white';
  
  return (
    <div 
      className={`fixed ${positionClasses} z-50 rounded-lg shadow-lg font-mono text-xs opacity-80 hover:opacity-100 transition-opacity select-none`}
    >
      <div className={`px-2 py-1 rounded-t-lg ${colorClasses}`}>
        {activeBreakpoint} ({width}×{height})
      </div>
      
      {showDetails && (
        <div className="bg-black/80 text-white px-2 py-1 rounded-b-lg space-y-1">
          <div>Mobile: {responsive.isMobile ? '✓' : '✗'}</div>
          <div>Tablet: {responsive.isTablet ? '✓' : '✗'}</div>
          <div>Desktop: {responsive.isDesktop ? '✓' : '✗'}</div>
          <div>LargeDesktop: {responsive.isLargeDesktop ? '✓' : '✗'}</div>
          <div>Orientation: {orientation}</div>
          <hr className="border-gray-700" />
          <div className="grid grid-cols-2 gap-x-3">
            {Object.entries(BREAKPOINTS).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span>{value}px</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveDebug;
