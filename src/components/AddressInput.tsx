'use client';

import React, { useRef, useState } from 'react';
import { useGooglePlaces } from '../hooks/useGooglePlaces';
import type { AddressData } from '../types/GooglePlacesTypes';

interface AddressInputProps {
  onAddressSelect?: (addressData: AddressData) => void;
  onChange?: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  error?: string;
  readOnly?: boolean;
}

export default function AddressInput({ 
  onAddressSelect,
  onChange, 
  className = '',
  defaultValue = '',
  value,
  error: externalError,
  readOnly = false
}: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  
  // Use value prop directly if provided, otherwise use defaultValue
  const displayValue = value !== undefined ? value : defaultValue;

  // Handle Google Places selection
  const handleAddressSelect = (addressData: AddressData) => {
    setSelectedAddress(addressData);
    
    // Notify parent component of the change
    if (onChange) {
      onChange(addressData.formattedAddress);
    }
    
    if (onAddressSelect) {
      onAddressSelect(addressData);
    }
  };

  // Always call hooks unconditionally (React rule)
  useGooglePlaces(inputRef, readOnly ? () => {} : handleAddressSelect);

  const error = externalError;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative w-full">
        {readOnly ? (
          <div className="w-full px-4 py-3 text-lg border rounded-lg bg-gray-50">
            {displayValue}
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter your property address"
            className={`w-full px-4 py-3 text-lg text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all
              ${error ? 'border-red-500' : 'border-gray-300'}`}
            value={displayValue}
            onChange={(e) => {
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            aria-label="Property address"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'address-error' : undefined}
            required
          />
        )}

        {error && !readOnly && (
          <p id="address-error" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {selectedAddress && !error && !readOnly && (
        <div className="flex flex-col space-y-2">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Selected: {selectedAddress.formattedAddress}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
