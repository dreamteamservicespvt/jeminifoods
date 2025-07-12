import React from 'react';
import { useResponsiveContext } from '@/contexts/ResponsiveContext';
import { ResponsiveDebug } from '@/components/dev/ResponsiveDebug';
import { 
  MobileOnly, 
  TabletOnly, 
  DesktopOnly, 
  LargeDesktopOnly,
  NotMobile
} from '@/components/ui/ResponsiveLayout';

/**
 * A component to demonstrate responsive layout features
 */
export const ResponsiveDemo: React.FC = () => {
  const responsive = useResponsiveContext();
  
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-responsive-title mb-8 font-bold text-amber-400">
        Responsive Layout System
      </h1>
      
      <div className="card-responsive bg-black/40 backdrop-blur-sm border border-amber-600/20">
        <h2 className="text-responsive-subtitle mb-4 text-cream">
          Current Breakpoint: <span className="text-amber-400">{responsive.activeBreakpoint}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-responsive">
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-amber-300">Device Information</h3>
            <ul className="space-y-2 text-cream/80">
              <li>Width: {responsive.width}px</li>
              <li>Height: {responsive.height}px</li>
              <li>Orientation: {responsive.orientation}</li>
              <li>Is Mobile: {responsive.isMobile ? 'Yes' : 'No'}</li>
              <li>Is Tablet: {responsive.isTablet ? 'Yes' : 'No'}</li>
              <li>Is Desktop: {responsive.isDesktop ? 'Yes' : 'No'}</li>
              <li>Is Large Desktop: {responsive.isLargeDesktop ? 'Yes' : 'No'}</li>
            </ul>
          </div>
          
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-amber-300">Conditional Rendering</h3>
            
            <MobileOnly>
              <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg text-red-300">
                This content is visible on mobile devices only!
              </div>
            </MobileOnly>
            
            <TabletOnly>
              <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-lg text-green-300">
                This content is visible on tablet devices only!
              </div>
            </TabletOnly>
            
            <DesktopOnly>
              <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-lg text-blue-300">
                This content is visible on desktop devices only!
              </div>
            </DesktopOnly>
            
            <LargeDesktopOnly>
              <div className="bg-purple-500/20 border border-purple-500/30 p-4 rounded-lg text-purple-300">
                This content is visible on large desktop devices only!
              </div>
            </LargeDesktopOnly>
          </div>
          
          <NotMobile>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-amber-300">Helper Classes</h3>
              <ul className="space-y-2 text-cream/80">
                <li><code>.flex-responsive</code> - Column on mobile, row on desktop</li>
                <li><code>.padding-responsive</code> - Scales padding with screen size</li>
                <li><code>.container-responsive</code> - Smart container width</li>
                <li><code>.touch-target</code> - Proper size for touch targets</li>
                <li><code>.safe-area-bottom</code> - Safe area for notched devices</li>
                <li><code>.hide-on-mobile</code> - Hides content on mobile</li>
                <li><code>.hide-on-desktop</code> - Hides content on desktop</li>
              </ul>
            </div>
          </NotMobile>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-medium mb-4 text-cream">Responsive Text</h2>
        <p className="text-responsive-body mb-4 text-cream/80">
          This text will adjust its size based on the viewport width. It helps create a more fluid 
          reading experience across different devices without requiring manual breakpoints for every text element.
        </p>
        
        <div className="flex-responsive gap-responsive my-8">
          <div className="flex-1 p-4 bg-black/40 backdrop-blur-sm border border-amber-600/20 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-amber-300">Mobile First</h3>
            <p className="text-cream/80">This section will stack vertically on mobile and horizontally on desktop.</p>
          </div>
          <div className="flex-1 p-4 bg-black/40 backdrop-blur-sm border border-amber-600/20 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-amber-300">Responsive Design</h3>
            <p className="text-cream/80">Using flexible layouts that adapt to different screen sizes.</p>
          </div>
        </div>
      </div>
      
      {/* Responsive debug overlay */}
      <ResponsiveDebug position="bottom-right" showDetails={true} />
    </div>
  );
};

export default ResponsiveDemo;
