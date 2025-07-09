'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PrefetchState {
  [route: string]: 'idle' | 'loading' | 'loaded' | 'error';
}

const MAIN_ROUTES = [
  '/firewalls/',
  '/interfaces/',
  '/vips/',
  '/ip-list/',
  '/policies/',
  '/addresses/',
  '/services/',
];

export function PrefetchManager() {
  const router = useRouter();
  const [prefetchState, setPrefetchState] = useState<PrefetchState>({});
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const prefetchRoutes = async () => {
      setShowIndicator(true);
      
      // Initialize all routes as idle
      const initialState: PrefetchState = {};
      MAIN_ROUTES.forEach(route => {
        initialState[route] = 'idle';
      });
      setPrefetchState(initialState);

      // Prefetch routes with staggered timing to avoid overwhelming the server
      for (let i = 0; i < MAIN_ROUTES.length; i++) {
        const route = MAIN_ROUTES[i];
        
        try {
          setPrefetchState(prev => ({ ...prev, [route]: 'loading' }));
          
          // Use Next.js router prefetch
          router.prefetch(route);
          
          // Simulate prefetch completion (Next.js prefetch is async but doesn't return a promise)
          await new Promise(resolve => setTimeout(resolve, 50 + i * 25));
          
          setPrefetchState(prev => ({ ...prev, [route]: 'loaded' }));
        } catch (error) {
          console.warn(`Failed to prefetch ${route}:`, error);
          setPrefetchState(prev => ({ ...prev, [route]: 'error' }));
        }
      }

      // Hide indicator after all prefetching is complete
      setTimeout(() => setShowIndicator(false), 100);
    };

    // Start prefetching after a short delay to not block initial render
    const timer = setTimeout(prefetchRoutes, 50);
    
    return () => clearTimeout(timer);
  }, [router]);

  // Additional prefetch on hover for dynamic routes
  const handleLinkHover = (href: string) => {
    if (href && !prefetchState[href]) {
      router.prefetch(href);
      setPrefetchState(prev => ({ ...prev, [href]: 'loading' }));
    }
  };

  // Expose hover handler globally for other components to use
  useEffect(() => {
    (window as any).__prefetchOnHover = handleLinkHover;
    
    return () => {
      delete (window as any).__prefetchOnHover;
    };
  }, [handleLinkHover]);

  // Temporarily disable the indicator to test
  return null;
}

// Hook for components to trigger prefetch on hover
export function usePrefetchOnHover() {
  return (href: string) => {
    if (typeof window !== 'undefined' && (window as any).__prefetchOnHover) {
      (window as any).__prefetchOnHover(href);
    }
  };
}