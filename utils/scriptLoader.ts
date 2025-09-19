import performanceMonitor from './performanceMonitor';

interface ScriptCache {
  [key: string]: Promise<void> | undefined;
}

const scriptCache: ScriptCache = {};

export function loadScript(src: string, id?: string): Promise<void> {
  // Return cached promise if script is already loading/loaded
  const cached = scriptCache[src];
  if (cached) {
    return cached;
  }

  const scriptName = id || src.split('/').pop() || 'script';
  performanceMonitor.markScriptLoadStart(scriptName);

  scriptCache[src] = new Promise((resolve, reject) => {
    // Check if script already exists in DOM
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    if (id) script.id = id;

    script.onload = () => {
      performanceMonitor.markScriptLoadEnd(scriptName);
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });

  return scriptCache[src];
}

export function loadGoogleMaps(): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key not found'));
  }

  // Use loading=async to reduce initial load
  const src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&loading=async`;
  
  return loadScript(src, 'google-maps-script').then(() => {
    // Ensure the API is fully loaded
    return new Promise<void>((resolve) => {
      if (window.google?.maps?.places) {
        resolve();
      } else {
        // Wait for API to be ready
        const checkInterval = setInterval(() => {
          if (window.google?.maps?.places) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 5000);
      }
    });
  });
}

export function loadGoogleTag(): Promise<void> {
  const src = 'https://www.googletagmanager.com/gtag/js?id=AW-16906023932';
  
  return loadScript(src, 'google-tag-manager').then(() => {
    // Initialize gtag after script loads
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    (window as any).gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'AW-16906023932');
    
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
    }

    // Add conversion tracking function
    (window as any).gtag_report_conversion = function(url?: string) {
      const callback = function () {
        if (typeof(url) != 'undefined') {
          window.location.href = url;
        }
      };
      gtag('event', 'conversion', {
        'send_to': 'AW-16906023932/phone_conversion',
        'value': 1.0,
        'currency': 'USD',
        'event_callback': callback
      });
      return false;
    };
  });
}

// Preload function that adds link tag without executing
export function preloadScript(src: string): void {
  const existingPreload = document.querySelector(`link[href="${src}"]`);
  if (existingPreload) return;

  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'script';
  preload.href = src;
  document.head.appendChild(preload);
}

// Facade pattern for Google Maps - minimal initial load
export function createGoogleMapsFacade() {
  let mapsPromise: Promise<void> | null = null;

  return {
    load: () => {
      if (!mapsPromise) {
        mapsPromise = loadGoogleMaps();
      }
      return mapsPromise;
    },
    isLoaded: () => {
      return Boolean(window.google?.maps?.places);
    },
    preload: () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        const src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&loading=async`;
        preloadScript(src);
      }
    }
  };
}

// Facade pattern for Google Tag - minimal initial load  
export function createGoogleTagFacade() {
  let tagPromise: Promise<void> | null = null;
  
  // Queue events before gtag loads
  const eventQueue: Array<{ name: string; params: any }> = [];
  
  const processQueue = () => {
    if ((window as any).gtag && eventQueue.length > 0) {
      eventQueue.forEach(({ name, params }) => {
        (window as any).gtag('event', name, params);
      });
      eventQueue.length = 0;
    }
  };

  return {
    load: () => {
      if (!tagPromise) {
        tagPromise = loadGoogleTag().then(() => {
          processQueue();
        });
      }
      return tagPromise;
    },
    isLoaded: () => {
      return Boolean((window as any).gtag);
    },
    trackEvent: (name: string, params: any) => {
      if ((window as any).gtag) {
        (window as any).gtag('event', name, params);
      } else {
        eventQueue.push({ name, params });
        // Trigger load on first event
        if (!tagPromise) {
          tagPromise = loadGoogleTag().then(() => {
            processQueue();
          });
        }
      }
    },
    preload: () => {
      preloadScript('https://www.googletagmanager.com/gtag/js?id=AW-16906023932');
    }
  };
}