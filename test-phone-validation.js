#!/usr/bin/env node

// Test script for phone validation functionality
// Run with: node test-phone-validation.js

const testPhoneNumbers = [
  { number: '(555) 555-5555', expected: false, description: 'Fake 555 number' },
  { number: '(123) 456-7890', expected: true, description: 'Valid format number' },
  { number: '(000) 000-0000', expected: false, description: 'All zeros' },
  { number: '(111) 111-1111', expected: false, description: 'Repeated digits' },
  { number: '(212) 555-1234', expected: false, description: 'NYC 555 exchange' },
  { number: 'not a phone', expected: false, description: 'Invalid format' },
  { number: '123456789', expected: false, description: 'Missing formatting' },
  { number: '(555) 123-456', expected: false, description: 'Wrong length' },
];

console.log('Testing Phone Validation API...\n');
console.log('Note: Make sure the dev server is running on port 3001\n');

async function testPhoneValidation(phone, expectedValid, description) {
  try {
    const response = await fetch('http://localhost:3001/api/validate-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    const result = await response.json();
    const passed = (result.isValid === expectedValid);
    
    console.log(`${passed ? '✅' : '❌'} ${description}`);
    console.log(`   Input: ${phone}`);
    console.log(`   Result: ${result.isValid ? 'Valid' : 'Invalid'} - ${result.message}`);
    if (!passed) {
      console.log(`   Expected: ${expectedValid ? 'Valid' : 'Invalid'}`);
    }
    console.log('');
    
    return passed;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Input: ${phone}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    return false;
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of testPhoneNumbers) {
    const result = await testPhoneValidation(test.number, test.expected, test.description);
    if (result) passed++;
    else failed++;
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('='.repeat(50));
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. This may be expected if:');
    console.log('- The Numverify API key is not configured');
    console.log('- The API is returning different validation results');
    console.log('- Rate limiting is in effect');
  }
}

// Run the tests
runTests().catch(console.error);