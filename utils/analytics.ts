export const initializeAnalytics = () => {
  // Analytics initialization now handled by Google Tag Manager
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
  }
};

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  // Push events to dataLayer for GTM to handle
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params
    });
  }
};

// Track a conversion event via GTM
export const trackConversion = (conversionLabel: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'conversion',
      conversion_label: conversionLabel,
      ...params
    });
  }
};

// Track the main lead form submission via GTM
export const trackLeadFormSubmission = (additionalParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'lead_form_submission',
      value: 1.0,
      currency: 'USD',
      ...additionalParams
    });
  }
}; 