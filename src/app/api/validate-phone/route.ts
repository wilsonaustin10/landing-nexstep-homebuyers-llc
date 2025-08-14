import { NextResponse } from 'next/server';
import { validatePhoneWithNumverify } from '@/utils/phoneValidation';
import { headers } from 'next/headers';
import { rateLimit } from '@/utils/rateLimit';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          isValid: false, 
          message: 'Too many validation attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { status: 429 }
      );
    }

    // Parse request body
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json(
        { isValid: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number with Numverify
    const validationResult = await validatePhoneWithNumverify(phone);
    
    // Log validation attempts for monitoring
    console.log('Phone validation attempt:', {
      phone: phone.replace(/\d(?=\d{4})/g, '*'), // Mask most digits for privacy
      isValid: validationResult.isValid,
      message: validationResult.message,
      ip: ip
    });

    return NextResponse.json(validationResult);
    
  } catch (error) {
    console.error('Phone validation error:', error);
    return NextResponse.json(
      { 
        isValid: false, 
        message: 'Unable to validate phone number. Please try again.' 
      },
      { status: 500 }
    );
  }
}