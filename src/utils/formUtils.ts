import debounce from 'lodash/debounce';
import { FormState } from '../types';

interface FormData {
  address?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  placeId?: string;
  phone?: string;
  email?: string;
  propertyCondition?: string;
  timeframe?: string;
  askingPrice?: string;
}

// Track last submission time to prevent duplicate submissions
const SUBMISSION_COOLDOWN = 5 * 60 * 1000; // 5 minutes
let lastSubmissionTime: { [key: string]: number } = {};

// Save form data to localStorage
const saveToLocalStorage = (formId: string, data: Partial<FormData>): boolean => {
  try {
    const existingData = localStorage.getItem(formId);
    const updatedData = {
      ...JSON.parse(existingData || '{}'),
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(formId, JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Check if enough time has passed since last submission
const canSubmitToCRM = (formId: string): boolean => {
  const now = Date.now();
  const lastSubmission = lastSubmissionTime[formId] || 0;
  return now - lastSubmission >= SUBMISSION_COOLDOWN;
};

// Generate unique key for form data to prevent duplicate submissions
const generateDataKey = (formData: Partial<FormData>): string => {
  const relevantData = {
    address: formData.address,
    phone: formData.phone,
    email: formData.email
  };
  return JSON.stringify(relevantData);
};



// Optimize timeouts and add request batching
const AUTOSAVE_DELAY = 15000; // Reduced to 15 seconds for better UX
const BATCH_INTERVAL = 30000; // 30 seconds for batching requests
let pendingSubmissions: Partial<FormData>[] = [];

// Enhanced validation
const validateFormData = (data: Partial<FormData>): boolean => {
  if (data.phone && !/^\+?[\d\s-()]{10,}$/.test(data.phone)) return false;
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return false;
  return true;
};

// Enhanced analytics tracking
const trackFormInteraction = (formData: Partial<FormData>, action: string): void => {
  try {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: 'Lead Form',
        event_label: Object.keys(formData).join(','),
        value: Object.keys(formData).length
      });
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', action, {
        content_name: 'Lead Form',
        content_category: 'Lead',
        fields_completed: Object.keys(formData).join(',')
      });
    }

    // Hotjar
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('event', action);
      (window as any).hj('trigger', 'form_interaction');
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Optimized auto-save to localStorage only
export const autoSaveForm = debounce(async (formId: string, formData: Partial<FormData>): Promise<void> => {
  if (!validateFormData(formData)) {
    console.warn('Invalid form data detected');
    return;
  }

  // Track interaction
  trackFormInteraction(formData, 'form_field_update');

  // Save to localStorage only - no partial submissions
  saveToLocalStorage(formId, formData);
}, AUTOSAVE_DELAY);


// Function to retrieve saved form data
export const getSavedFormData = (formId: string): Partial<FormData> => {
  try {
    const savedData = localStorage.getItem(formId);
    return savedData ? JSON.parse(savedData) : {};
  } catch {
    return {};
  }
};

// Function to clear saved form data
export const clearSavedFormData = (formId: string): void => {
  try {
    localStorage.removeItem(formId);
    localStorage.removeItem(`${formId}_submitted`);
    delete lastSubmissionTime[formId];
  } catch (error) {
    console.error('Error clearing form data:', error);
  }
};

// Timeout duration in milliseconds
const PARTIAL_LEAD_TIMEOUT = 60000; // 1 minute

// No longer supporting partial lead capture - only complete form submissions
export function setupPartialLeadCapture(formState: FormState) {
  // This function is kept for backward compatibility but does nothing
  // All lead submissions must be complete
  return () => {};
}

// Calculate lead quality score based on available data
function calculateLeadScore(formState: FormState): number {
  let score = 0;
  
  // Core fields
  if (formState.address) score += 30;
  if (formState.phone) score += 30;
  
  // Additional fields
  if (formState.propertyCondition) score += 10;
  if (formState.timeframe) score += 10;
  if (formState.price) score += 10;
  
  // Contact info
  if (formState.email) score += 5;
  if (formState.firstName) score += 2.5;
  if (formState.lastName) score += 2.5;
  
  return score;
}

// Calculate dynamic timeout based on user interaction
function calculateDynamicTimeout(formState: FormState): number {
  const fieldsCompleted = Object.keys(formState).filter(key => Boolean(formState[key as keyof FormState])).length;
  const baseAdjustment = 15000; // 15 seconds per field
  return fieldsCompleted * baseAdjustment;
} 