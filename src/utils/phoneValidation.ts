interface NumverifyResponse {
  valid: boolean;
  number?: string;
  local_format?: string;
  international_format?: string;
  country_prefix?: string;
  country_code?: string;
  country_name?: string;
  location?: string;
  carrier?: string;
  line_type?: string;
  error?: {
    code: number;
    type: string;
    info: string;
  };
}

export async function validatePhoneWithNumverify(phoneNumber: string): Promise<{
  isValid: boolean;
  message: string;
  details?: Partial<NumverifyResponse>;
}> {
  try {
    const apiKey = process.env.NUMVERIFY_API_KEY;
    
    if (!apiKey) {
      console.error('Numverify API key not configured');
      // Fallback to basic validation if API key is not set
      return {
        isValid: true,
        message: 'Phone validation service unavailable, basic validation passed'
      };
    }

    // Clean the phone number - remove all non-digits
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    
    // For US numbers, ensure we have country code
    const numberToValidate = cleanedNumber.length === 10 ? `1${cleanedNumber}` : cleanedNumber;

    // Call Numverify API
    const response = await fetch(
      `https://apilayer.net/api/validate?access_key=${apiKey}&number=${numberToValidate}&country_code=US&format=1`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      console.error('Numverify API error:', response.status);
      return {
        isValid: false,
        message: 'Unable to validate phone number. Please try again.'
      };
    }

    const data: NumverifyResponse = await response.json();

    // Check for API errors
    if (data.error) {
      console.error('Numverify API returned error:', data.error);
      return {
        isValid: false,
        message: 'Phone validation failed. Please check your number and try again.'
      };
    }

    // Check if the number is valid
    if (!data.valid) {
      return {
        isValid: false,
        message: 'Please enter a valid US phone number',
        details: data
      };
    }

    // Additional checks for US numbers
    if (data.country_code !== 'US') {
      return {
        isValid: false,
        message: 'Please enter a valid US phone number',
        details: data
      };
    }

    // Check for VOIP or invalid line types that might indicate fake numbers
    const suspiciousLineTypes = ['voip', 'toll_free', 'premium_rate', 'unknown'];
    if (data.line_type && suspiciousLineTypes.includes(data.line_type.toLowerCase())) {
      return {
        isValid: false,
        message: 'Please enter a valid mobile or landline phone number',
        details: data
      };
    }

    // Phone is valid
    return {
      isValid: true,
      message: 'Phone number verified',
      details: {
        number: data.number,
        carrier: data.carrier,
        line_type: data.line_type,
        location: data.location
      }
    };

  } catch (error) {
    console.error('Error validating phone with Numverify:', error);
    // On network error, allow the submission but log it
    return {
      isValid: true,
      message: 'Phone validation service temporarily unavailable'
    };
  }
}

// Client-side basic validation before API call
export function basicPhoneValidation(phone: string): { isValid: boolean; message?: string } {
  const phoneDigits = phone.replace(/\D/g, '');
  
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  if (phoneDigits.length !== 10) {
    return { isValid: false, message: 'Phone number must be 10 digits' };
  }
  
  // Check for obviously fake patterns
  const fakePatterns = [
    /^(\d)\1{9}$/, // All same digit (e.g., 1111111111)
    /^123456789\d$/, // Sequential digits
    /^000/, // Starts with 000
    /^555555/, // Multiple 5s (often used for fake numbers)
  ];
  
  for (const pattern of fakePatterns) {
    if (pattern.test(phoneDigits)) {
      return { isValid: false, message: 'Please enter a real phone number' };
    }
  }
  
  return { isValid: true };
}