'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../context/FormContext';
import AddressInput from './AddressInput';
import type { AddressData } from '../types/GooglePlacesTypes';
import { trackEvent, trackConversion } from '../utils/analytics';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { basicPhoneValidation } from '../utils/phoneValidation';

interface FormErrors {
  address?: string;
  phone?: string;
  consent?: string;
  submit?: string;
}

export default function PropertyForm() {
  const router = useRouter();
  const { formState, updateFormData } = useForm();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingPhone, setIsValidatingPhone] = useState(false);
  const [phoneValidated, setPhoneValidated] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const phoneValidationTimeoutRef = useRef<NodeJS.Timeout>();

  const validatePhoneNumber = async (phone: string) => {
    // First do basic validation
    const basicValidation = basicPhoneValidation(phone);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    // Then validate with Numverify API
    try {
      setIsValidatingPhone(true);
      const response = await fetch('/api/validate-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Phone validation error:', error);
      // On error, return success to not block submission
      return { isValid: true, message: 'Phone validation service unavailable' };
    } finally {
      setIsValidatingPhone(false);
    }
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleAddressSelect = (addressData: AddressData) => {
    trackEvent('property_address_selected', { 
      address: addressData.formattedAddress,
      placeId: addressData.placeId 
    });
    updateFormData(addressData);
    setErrors(prev => ({ ...prev, address: undefined }));
    setTouched(prev => ({ ...prev, address: true }));
    setStep(2);
  };

  const formatPhoneNumber = (value: string) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length < 4) return phone;
    if (phone.length < 7) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateFormData({ phone: formatted });
    setPhoneValidated(false);
    
    // Clear any previous validation timeout
    if (phoneValidationTimeoutRef.current) {
      clearTimeout(phoneValidationTimeoutRef.current);
    }
    
    // Basic validation first
    const phoneDigits = formatted.replace(/\D/g, '');
    if (phoneDigits.length !== 10 && touched.phone) {
      setErrors(prev => ({
        ...prev,
        phone: phoneDigits.length < 10 ? 'Phone number must be 10 digits' : undefined
      }));
    } else {
      // Clear error while typing valid length
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
      
      // Validate with API after user stops typing (debounced)
      if (phoneDigits.length === 10) {
        phoneValidationTimeoutRef.current = setTimeout(async () => {
          const validation = await validatePhoneNumber(formatted);
          if (!validation.isValid) {
            setErrors(prev => ({ ...prev, phone: validation.message || 'Please enter a real phone number' }));
          } else {
            setPhoneValidated(true);
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.phone;
              return newErrors;
            });
          }
        }, 500); // 500ms debounce
      }
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {};

    if (!formState.address?.trim()) {
      newErrors.address = 'Please enter a valid property address';
    }

    const phoneDigits = formState.phone?.replace(/\D/g, '') || '';
    if (!formState.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (phoneDigits.length !== 10) {
      newErrors.phone = 'Phone number must be 10 digits';
    } else if (!phoneValidated) {
      // Validate phone if not already validated
      const validation = await validatePhoneNumber(formState.phone);
      if (!validation.isValid) {
        newErrors.phone = validation.message || 'Please enter a real phone number';
      } else {
        setPhoneValidated(true);
      }
    }

    if (!formState.consent) {
      newErrors.consent = 'You must consent to be contacted';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form before submission
      const isValid = await validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      // Generate a unique leadId for tracking
      const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      updateFormData({ leadId });

      trackEvent('initial_form_completed', { 
        address: formState.address,
        hasPhone: !!formState.phone,
        phoneValidated: phoneValidated
      });

      // Navigate to property-listed page to continue collecting information
      router.push('/property-listed');
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white/90 p-6 rounded-lg shadow-lg">
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Enter Your Property Address</h2>
          <AddressInput 
            onAddressSelect={handleAddressSelect}
            error={touched.address ? errors.address : undefined}
          />
          {errors.address && touched.address && (
            <div className="flex items-center space-x-1 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.address}</span>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Enter Your Phone Number</h2>
          <div className="space-y-1">
            <input
              type="tel"
              placeholder="(555) 555-5555"
              className={`w-full px-4 py-3 text-lg text-gray-900 border rounded-lg transition-colors
                ${errors.phone && touched.phone 
                  ? 'border-red-500 focus:ring-red-500' 
                  : phoneValidated 
                    ? 'border-green-500 focus:ring-green-500'
                    : 'border-gray-300 focus:ring-blue-500'}
                focus:ring-2 focus:border-transparent`}
              value={formState.phone || ''}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('phone')}
              maxLength={14}
              required
              aria-invalid={Boolean(errors.phone && touched.phone)}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            
            {errors.phone && touched.phone && (
              <div id="phone-error" className="flex items-center space-x-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.phone}</span>
              </div>
            )}
            {isValidatingPhone && (
              <div className="flex items-center space-x-1 text-gray-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Validating phone...</span>
              </div>
            )}
            {phoneValidated && !errors.phone && (
              <div className="flex items-center space-x-1 text-green-600 text-sm">
                <Check className="h-4 w-4" />
                <span>Phone verified</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                checked={formState.consent || false}
                onChange={(e) => updateFormData({ consent: e.target.checked })}
                onBlur={() => handleBlur('consent')}
                required
              />
              <span className="text-sm text-gray-600">
                By checking this box, I consent to being contacted by phone, email, or text message about my property sale inquiry, including through auto-dialed or pre-recorded messages.
              </span>
            </label>
            {errors.consent && touched.consent && (
              <div className="flex items-center space-x-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.consent}</span>
              </div>
            )}
          </div>
          
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !formState.phone || !formState.consent || !!errors.phone}
            onClick={() => {
              if (formState.phone && formState.consent && !errors.phone && !isSubmitting) {
                trackConversion('AW-17041108639', 'sghECKX6-fkYELD4yf8p');
              }
            }}
            className={`w-full px-4 py-3 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors
              ${(isSubmitting || !formState.phone || !formState.consent || !!errors.phone) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Submitting...
              </span>
            ) : (
              'Get Your Cash Offer'
            )}
          </button>
        </div>
      )}
    </form>
  );
}