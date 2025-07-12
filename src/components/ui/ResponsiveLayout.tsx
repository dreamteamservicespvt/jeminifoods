import React from 'react';
import { useResponsiveContext } from '@/contexts/ResponsiveContext';
import { Breakpoint } from '@/hooks/useResponsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showOnlyOn?: Breakpoint[];
  hideOnlyOn?: Breakpoint[];
  showOn?: 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';
  hideOn?: 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';
  className?: string;
  as?: React.ElementType;
}

/**
 * A component for conditionally rendering content based on screen size
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  showOnlyOn = [],
  hideOnlyOn = [],
  showOn,
  hideOn,
  className = '',
  as: Component = 'div',
}) => {
  const responsive = useResponsiveContext();
  
  // Check if the current breakpoint matches the showOnlyOn array
  const shouldShowForBreakpoint = showOnlyOn.length > 0 
    ? showOnlyOn.some(breakpoint => responsive.is(breakpoint))
    : true;

  // Check if the current breakpoint matches the hideOnlyOn array
  const shouldHideForBreakpoint = hideOnlyOn.length > 0 
    ? hideOnlyOn.some(breakpoint => responsive.is(breakpoint)) 
    : false;

  // Check device type conditions
  const shouldShowForDeviceType = showOn
    ? showOn === 'mobile' 
      ? responsive.isMobile
      : showOn === 'tablet'
      ? responsive.isTablet
      : showOn === 'desktop'
      ? responsive.isDesktop
      : responsive.isLargeDesktop
    : true;

  const shouldHideForDeviceType = hideOn
    ? hideOn === 'mobile'
      ? responsive.isMobile
      : hideOn === 'tablet'
      ? responsive.isTablet
      : hideOn === 'desktop'
      ? responsive.isDesktop
      : responsive.isLargeDesktop
    : false;

  // Combined visibility logic
  const isVisible = shouldShowForBreakpoint && shouldShowForDeviceType && 
                   !shouldHideForBreakpoint && !shouldHideForDeviceType;
  
  if (!isVisible) return null;
  
  return <Component className={className}>{children}</Component>;
};

// Convenience components
export const MobileOnly: React.FC<Omit<ResponsiveLayoutProps, 'showOn'>> = (props) => (
  <ResponsiveLayout {...props} showOn="mobile" />
);

export const TabletOnly: React.FC<Omit<ResponsiveLayoutProps, 'showOn'>> = (props) => (
  <ResponsiveLayout {...props} showOn="tablet" />
);

export const DesktopOnly: React.FC<Omit<ResponsiveLayoutProps, 'showOn'>> = (props) => (
  <ResponsiveLayout {...props} showOn="desktop" />
);

export const LargeDesktopOnly: React.FC<Omit<ResponsiveLayoutProps, 'showOn'>> = (props) => (
  <ResponsiveLayout {...props} showOn="largeDesktop" />
);

export const NotMobile: React.FC<Omit<ResponsiveLayoutProps, 'hideOn'>> = (props) => (
  <ResponsiveLayout {...props} hideOn="mobile" />
);

export const NotDesktop: React.FC<Omit<ResponsiveLayoutProps, 'hideOn'>> = (props) => (
  <ResponsiveLayout {...props} hideOn="desktop" hideOnlyOn={['xl', '2xl']} />
);
