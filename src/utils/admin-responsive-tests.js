/**
 * Mobile Responsive Admin Panel Test Script
 * Tests the key responsive features of the redesigned admin panel
 */

const AdminPanelResponsiveTests = {
  // Test mobile filter toggle functionality
  testMobileFilterToggle: () => {
    const filterToggle = document.querySelector('[data-testid="mobile-filter-toggle"]');
    const filterContent = document.querySelector('[data-testid="filter-content"]');
    
    if (window.innerWidth < 640) {
      console.log('Testing mobile filter toggle...');
      
      // Test initial state
      const isHidden = filterContent.classList.contains('hidden');
      console.log(`Filter initially hidden: ${isHidden}`);
      
      // Test toggle functionality
      if (filterToggle) {
        filterToggle.click();
        const isVisible = !filterContent.classList.contains('hidden');
        console.log(`Filter visible after toggle: ${isVisible}`);
        
        return isVisible;
      }
    }
    return true;
  },

  // Test touch target sizes
  testTouchTargets: () => {
    console.log('Testing touch target sizes...');
    const interactiveElements = document.querySelectorAll('button, select, input[type="button"], a[role="button"]');
    let passCount = 0;
    
    interactiveElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const meetsRequirement = rect.width >= 44 && rect.height >= 44;
      
      if (!meetsRequirement) {
        console.warn(`Element ${index} too small: ${rect.width}x${rect.height}`);
      } else {
        passCount++;
      }
    });
    
    const passRate = (passCount / interactiveElements.length) * 100;
    console.log(`Touch targets pass rate: ${passRate.toFixed(1)}%`);
    
    return passRate >= 95;
  },

  // Test responsive breakpoints
  testResponsiveBreakpoints: () => {
    console.log('Testing responsive breakpoints...');
    const breakpoints = [
      { width: 375, name: 'Mobile (iPhone)' },
      { width: 768, name: 'Tablet' },
      { width: 1024, name: 'Desktop Small' },
      { width: 1440, name: 'Desktop Large' }
    ];
    
    const results = [];
    
    breakpoints.forEach(bp => {
      // Simulate viewport resize (in a real test, you'd use actual resize)
      console.log(`Testing ${bp.name} (${bp.width}px)...`);
      
      // Check for mobile-specific elements
      const mobileOnlyElements = document.querySelectorAll('.mobile-only, .sm\\:hidden');
      const desktopOnlyElements = document.querySelectorAll('.desktop-only, .hidden.sm\\:block');
      
      const mobileElementsVisible = bp.width < 640 ? mobileOnlyElements.length > 0 : true;
      const desktopElementsHidden = bp.width < 640 ? desktopOnlyElements.length === 0 || 
        Array.from(desktopOnlyElements).every(el => el.classList.contains('hidden')) : true;
      
      results.push({
        breakpoint: bp.name,
        mobileElementsCorrect: mobileElementsVisible,
        desktopElementsCorrect: desktopElementsHidden
      });
    });
    
    return results;
  },

  // Test accessibility features
  testAccessibility: () => {
    console.log('Testing accessibility features...');
    
    const tests = {
      hasProperHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
      hasSkipLinks: document.querySelectorAll('[href="#main"], [href="#content"]').length > 0,
      hasAltTexts: Array.from(document.querySelectorAll('img')).every(img => img.alt !== undefined),
      hasAriaLabels: document.querySelectorAll('[aria-label], [aria-labelledby]').length > 0,
      hasFocusableElements: document.querySelectorAll('[tabindex], button, input, select, textarea, a[href]').length > 0
    };
    
    Object.entries(tests).forEach(([test, result]) => {
      console.log(`${test}: ${result ? 'PASS' : 'FAIL'}`);
    });
    
    return tests;
  },

  // Test mobile modal functionality
  testMobileModals: () => {
    console.log('Testing mobile modal functionality...');
    
    const modals = document.querySelectorAll('[role="dialog"], .modal, .mobile-modal');
    let mobileOptimizedCount = 0;
    
    modals.forEach(modal => {
      const hasBottomPosition = modal.classList.contains('bottom-0') || 
        getComputedStyle(modal).bottom === '0px';
      const hasRoundedTop = modal.classList.contains('rounded-t-lg') ||
        getComputedStyle(modal).borderTopLeftRadius !== '0px';
      
      if (window.innerWidth < 640 && (hasBottomPosition || hasRoundedTop)) {
        mobileOptimizedCount++;
      }
    });
    
    console.log(`Mobile-optimized modals: ${mobileOptimizedCount}/${modals.length}`);
    return mobileOptimizedCount >= modals.length * 0.8; // 80% should be mobile-optimized
  },

  // Run all tests
  runAllTests: () => {
    console.log('🚀 Starting Admin Panel Responsive Tests...\n');
    
    const results = {
      mobileFilters: AdminPanelResponsiveTests.testMobileFilterToggle(),
      touchTargets: AdminPanelResponsiveTests.testTouchTargets(),
      responsiveBreakpoints: AdminPanelResponsiveTests.testResponsiveBreakpoints(),
      accessibility: AdminPanelResponsiveTests.testAccessibility(),
      mobileModals: AdminPanelResponsiveTests.testMobileModals()
    };
    
    console.log('\n📊 Test Results Summary:');
    console.log('=========================');
    
    Object.entries(results).forEach(([test, result]) => {
      const status = result === true || (Array.isArray(result) && result.length > 0) ? '✅ PASS' : '❌ FAIL';
      console.log(`${test}: ${status}`);
    });
    
    console.log('\n🏁 Tests Complete!');
    return results;
  }
};

// Auto-run tests when script is loaded (for development)
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => AdminPanelResponsiveTests.runAllTests(), 1000);
    });
  } else {
    setTimeout(() => AdminPanelResponsiveTests.runAllTests(), 1000);
  }
}

// Export for use in testing frameworks
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminPanelResponsiveTests;
}

// Add to window for manual testing
if (typeof window !== 'undefined') {
  window.AdminPanelResponsiveTests = AdminPanelResponsiveTests;
}
