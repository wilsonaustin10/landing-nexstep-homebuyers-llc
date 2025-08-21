'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Phone, Mail, Home, Clock, Wrench, Check, AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import AddressInput from './AddressInput';
import type { AddressData } from '../types/GooglePlacesTypes';
import { basicPhoneValidation } from '../utils/phoneValidation';

interface FormData {
  address: string;
  full_name: string;
  phone: string;
  email?: string;
  price?: string;
  sell_timing: string;
  condition: string;
  consent: boolean;
  placeId?: string;
}

interface FormErrors {
  [key: string]: string;
}

interface MultiStepFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  city?: string;
  state?: string;
}

export default function MultiStepForm({ onSubmit, city = 'Your City', state = 'ST' }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingPhone, setIsValidatingPhone] = useState(false);
  const [phoneValidated, setPhoneValidated] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const phoneValidationTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [formData, setFormData] = useState<FormData>({
    address: '',
    full_name: '',
    phone: '',
    email: '',
    price: '',
    sell_timing: '',
    condition: '',
    consent: false,
  });

  useEffect(() => {
    if (Object.keys(errors).length > 0 && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [errors]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'lead_step_view',
        step_id: currentStep === 1 ? 'address' : 'contact'
      });
    }
  }, [currentStep]);

  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const formatPrice = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/[^\d]/g, '');
    
    // Convert to number and format with commas
    if (digits) {
      const number = parseInt(digits, 10);
      return '$' + number.toLocaleString('en-US');
    }
    return '';
  };

  const handleAddressSelect = (addressData: AddressData) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.formattedAddress || '',
      placeId: addressData.placeId,
    }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.address;
      return newErrors;
    });
  };

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const result = await response.json();
      return {
        isValid: result.isValid,
        message: result.message || (result.isValid ? undefined : 'Please enter a real phone number')
      };
    } catch (error) {
      console.error('Phone validation error:', error);
      // On error, allow the phone but mark as not validated
      return { isValid: true, message: undefined };
    } finally {
      setIsValidatingPhone(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!touched.has(field) && typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'lead_field_input',
        field: field
      });
      setTouched(prev => new Set(prev).add(field));
    }

    if (field === 'phone') {
      value = formatPhoneNumber(value);
      setPhoneValidated(false);
      
      // Clear any existing timeout
      if (phoneValidationTimeoutRef.current) {
        clearTimeout(phoneValidationTimeoutRef.current);
      }
      
      // Validate phone after user stops typing for 1 second
      if (value.replace(/\D/g, '').length === 10) {
        phoneValidationTimeoutRef.current = setTimeout(async () => {
          const validation = await validatePhoneNumber(value);
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
        }, 1000);
      }
    }

    if (field === 'price') {
      value = formatPrice(value);
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field] && field !== 'phone') {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.address.trim()) {
      newErrors.address = 'Please enter your property address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = async (): Promise<boolean> => {
    const newErrors: FormErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Enter your full name';
    }
    
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone) {
      newErrors.phone = 'Enter your phone number';
    } else if (phoneDigits.length !== 10) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    } else if (!phoneValidated) {
      // Validate phone if not already validated
      const validation = await validatePhoneNumber(formData.phone);
      if (!validation.isValid) {
        newErrors.phone = validation.message || 'Please enter a real phone number';
      } else {
        setPhoneValidated(true);
      }
    }
    
    // Email is now required
    if (!formData.email) {
      newErrors.email = 'Enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    
    // Price is now required
    if (!formData.price) {
      newErrors.price = 'Enter your desired price for a cash offer';
    }
    
    if (!formData.sell_timing) {
      newErrors.sell_timing = 'Select when you want to sell';
    }
    
    if (!formData.condition) {
      newErrors.condition = 'Select your property condition';
    }
    
    // Consent is optional per 10DLC requirements - users can submit without checking
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    const isValid = await validateStep2();
    
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      await onSubmit(formData);
      
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'lead_submit',
          lead: {
            city: city,
            state: state,
            timing: formData.sell_timing
          }
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'There was an error submitting your request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Property Address</span>
          </div>
          <div className="h-px bg-gray-300 flex-1 mx-4" />
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Contact Info</span>
          </div>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div 
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <h2 className="text-red-800 font-semibold mb-2 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            There's a problem
          </h2>
          <ul className="list-disc list-inside text-sm text-red-700">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <a href={`#${field}`} className="underline hover:no-underline">
                  {error}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Property Address <span className="text-red-500">*</span>
            </label>
            <AddressInput
              onAddressSelect={handleAddressSelect}
              onChange={(value) => handleFieldChange('address', value)}
              error={errors.address}
              value={formData.address}
            />
            {errors.address && (
              <p id="err_address" className="mt-1 text-sm text-red-600">
                {errors.address}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            Continue to Contact Info
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => handleFieldChange('full_name', e.target.value)}
              autoComplete="name"
              aria-invalid={!!errors.full_name}
              aria-describedby={errors.full_name ? 'err_full_name' : undefined}
              className={`w-full px-4 py-3 text-gray-900 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.full_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.full_name && (
              <p id="err_full_name" className="mt-1 text-sm text-red-600">
                {errors.full_name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              autoComplete="tel"
              placeholder="(555) 123-4567"
              required
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'err_phone' : undefined}
              className={`w-full px-4 py-3 text-gray-900 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : phoneValidated ? 'border-green-500' : 'border-gray-300'
              }`}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.phone && (
                <p id="err_phone" className="text-sm text-red-600">
                  {errors.phone}
                </p>
              )}
              {isValidatingPhone && (
                <p className="text-sm text-gray-500 flex items-center">
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Validating phone...
                </p>
              )}
              {phoneValidated && !errors.phone && (
                <p className="text-sm text-green-600 flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  Phone verified
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              autoComplete="email"
              placeholder="your@email.com"
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'err_email' : undefined}
              className={`w-full px-4 py-3 text-gray-900 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p id="err_email" className="mt-1 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Best price for a cash offer? <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              type="text"
              inputMode="numeric"
              placeholder="$150,000"
              required
              value={formData.price}
              onChange={(e) => handleFieldChange('price', e.target.value)}
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? 'err_price' : undefined}
              className={`w-full px-4 py-3 text-gray-900 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.price && (
              <p id="err_price" className="mt-1 text-sm text-red-600">
                {errors.price}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When do you want to sell? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {['ASAP', '30 Days', '60-90 Days'].map((timing) => (
                <label key={timing} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="sell_timing"
                    value={timing}
                    checked={formData.sell_timing === timing}
                    onChange={(e) => handleFieldChange('sell_timing', e.target.value)}
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <span className="flex items-center text-gray-900">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    {timing}
                  </span>
                </label>
              ))}
            </div>
            {errors.sell_timing && (
              <p className="mt-1 text-sm text-red-600">
                {errors.sell_timing}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Condition <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {['Poor', 'Fair', 'Excellent'].map((condition) => (
                <label key={condition} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="condition"
                    value={condition}
                    checked={formData.condition === condition}
                    onChange={(e) => handleFieldChange('condition', e.target.value)}
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <span className="flex items-center text-gray-900">
                    <Wrench className="w-4 h-4 mr-2 text-gray-500" />
                    {condition}
                  </span>
                </label>
              ))}
            </div>
            {errors.condition && (
              <p className="mt-1 text-sm text-red-600">
                {errors.condition}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.consent}
                onChange={(e) => handleFieldChange('consent', e.target.checked)}
                className="mt-1 mr-3 h-5 w-5 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-600">
                I agree to be contacted by NexStep Homebuyers about my property. Message frequency varies. Message and data rates may apply. Reply STOP to unsubscribe or HELP for help. I understand that consent is not a condition of purchase.
              </span>
            </label>
            {errors.consent && (
              <p className="mt-1 text-sm text-red-600">
                {errors.consent}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  Submitting...
                </>
              ) : (
                'Get My Cash Offer'
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}