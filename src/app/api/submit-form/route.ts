import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { validatePhoneWithNumverify } from '@/utils/phoneValidation';

// Validate complete form data
async function validateFormData(data: Partial<LeadFormData>): Promise<boolean> {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Required fields validation with better error messages
  const requiredFields: { field: keyof LeadFormData; displayName: string }[] = [
    { field: 'address', displayName: 'Property address' },
    { field: 'phone', displayName: 'Phone number' },
    { field: 'firstName', displayName: 'First name' },
    { field: 'lastName', displayName: 'Last name' },
    { field: 'email', displayName: 'Email address' },
    { field: 'propertyCondition', displayName: 'Property condition' },
    { field: 'timeframe', displayName: 'Selling timeframe' },
    { field: 'price', displayName: 'Desired price' },
    { field: 'leadId', displayName: 'Lead ID' }
  ];
  
  for (const { field, displayName } of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !(data[field] as string).trim())) {
      throw new Error(`${displayName} is required`);
    }
  }

  // Phone number format validation
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(data.phone as string)) {
    throw new Error('Invalid phone number format. Expected format: (XXX) XXX-XXXX');
  }

  // Validate phone with Numverify for extra verification
  const phoneValidation = await validatePhoneWithNumverify(data.phone as string);
  if (!phoneValidation.isValid) {
    throw new Error(phoneValidation.message || 'Invalid phone number');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email as string)) {
    throw new Error('Invalid email address format');
  }

  return true;
}

// Send data to Zapier webhook
async function sendToZapier(data: LeadFormData) {
  // Debug log to check environment variable
  console.log('ZAPIER_WEBHOOK_URL value:', process.env.ZAPIER_WEBHOOK_URL);
  
  // Use environment variable or fallback to the value from .env.local if it exists
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  
  if (!webhookUrl) {
    throw new Error('Zapier webhook URL not configured');
  }

  try {
    // Format data for Zapier
    const formattedTimestamp = new Date().toLocaleString();
    
    // Create a comprehensive payload with all form data
    const payload = {
      ...data,
      submissionType: 'complete',
      formattedTimestamp,
      phoneRaw: data.phone ? data.phone.replace(/\D/g, '') : '',
      isPropertyListedText: data.isPropertyListed ? 'Yes' : 'No',
      fullName: `${data.firstName} ${data.lastName}`
    };

    // Send to Zapier webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zapier webhook error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to send to Zapier: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in sendToZapier:', error);
    throw error;
  }
}

/**
 * API Route for saving complete property details
 * Used for full form submissions with all property information
 */
export async function POST(request: Request) {
  try {
    // Log incoming request
    console.log('Received complete form submission request');

    // 1. Rate limiting check
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const timestamp = new Date().toISOString();
    
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      console.log('Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // 2. Parse and validate request data
    let data;
    try {
      data = await request.json();
      console.log('Received form data:', {
        hasRequiredFields: true,
        leadId: data.leadId
      });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate form data (now async with phone validation)
    try {
      await validateFormData(data);
    } catch (validationError) {
      const errorMessage = validationError instanceof Error ? validationError.message : 'Invalid form data';
      console.error('Form validation error:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // 3. Prepare data with tracking information
    const formData: LeadFormData = {
      ...data,
      timestamp: data.timestamp || timestamp,
      lastUpdated: timestamp
    };

    // 4. Send to Zapier webhook
    try {
      const result = await sendToZapier(formData);
      console.log('Successfully sent to Zapier webhook');
      
      return NextResponse.json({ 
        success: true,
        leadId: data.leadId
      });
    } catch (error) {
      console.error('Failed to send to Zapier:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error submitting complete form:', error);
    // Return a specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 