'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MultiStepForm from '../../components/MultiStepForm';
import { 
  Home, DollarSign, Clock, Wrench, Phone, MessageSquare, 
  CheckCircle, Star, MapPin, Shield, Award, TrendingUp,
  ChevronDown, ChevronUp, ArrowRight, MoreHorizontal
} from 'lucide-react';
import Script from 'next/script';
import Image from 'next/image';

const companyName = 'NexStep Homebuyers';
const phoneNumber = '(636) 238-5598';

function OfferPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  
  // Dynamic location based on URL parameters with fallbacks
  const city = searchParams.get('city') || searchParams.get('utm_city') || 'St. Louis';
  const state = searchParams.get('state') || searchParams.get('utm_state') || 'MO';
  const metro = searchParams.get('metro') || searchParams.get('utm_metro') || `${city}`;

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = document.getElementById('hero')?.offsetHeight || 600;
      setIsSticky(window.scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFormSubmit = async (formData: any) => {
    try {
      // Ensure leadId is unique
      const leadId = `offer-${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      // Extract first and last name from full name
      const nameParts = formData.full_name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Remove $ and commas from price for storage
      const cleanPrice = formData.price ? formData.price.replace(/[$,]/g, '') : '';
      
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          source: 'offer-page',
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          propertyCondition: formData.condition,
          timeframe: formData.sell_timing,
          price: cleanPrice,
          consent: formData.consent,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        if (window.gtag) {
          window.gtag('event', 'conversion', {
            'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
            'value': 1.0,
            'currency': 'USD'
          });
        }
        router.push('/thank-you');
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  };

  const handlePhoneClick = () => {
    if (window.dataLayer) {
      window.dataLayer.push({ event: 'cta_click', type: 'phone' });
    }
  };

  const handleSmsClick = () => {
    if (window.dataLayer) {
      window.dataLayer.push({ event: 'cta_click', type: 'sms' });
    }
  };

  const faqs = [
    {
      question: `How fast can you close on my ${city} property?`,
      answer: 'We can typically close in as little as 7-14 days, depending on your timeline. If you need more time, we\'re flexible and can work with your schedule.'
    },
    {
      question: 'Will I need to make any repairs before selling?',
      answer: 'No repairs needed! We buy houses in any condition - from move-in ready to properties that need major repairs. We handle all the work after purchase.'
    },
    {
      question: 'Are there any fees or commissions?',
      answer: 'Zero fees or commissions! Unlike traditional real estate sales, you keep 100% of the offer price. We even cover closing costs.'
    },
    {
      question: 'How do you determine your offer price?',
      answer: 'We evaluate comparable sales in your area, the property condition, and current market conditions to make a fair, competitive cash offer.'
    },
    {
      question: `What areas of ${city} do you serve?`,
      answer: `We buy houses throughout the entire ${metro} metroplex, including all surrounding suburbs and neighborhoods.`
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      location: `${city}, ${state}`,
      rating: 5,
      text: 'Sold my inherited property in just 10 days. No repairs, no hassle, and they handled everything professionally.',
      timeAgo: '1 week ago',
      initials: 'SM',
      bgColor: 'bg-red-500'
    },
    {
      name: 'Michael R.',
      location: 'Fort Worth, TX',
      rating: 5,
      text: 'Facing foreclosure and needed to sell fast. NexStep gave me a fair offer and closed in a week. Saved my credit!',
      timeAgo: '2 months ago',
      initials: 'MR',
      bgColor: 'bg-blue-500'
    },
    {
      name: 'Jennifer L.',
      location: 'Arlington, TX',
      rating: 5,
      text: 'The house needed too many repairs to list traditionally. They bought it as-is and the process was incredibly smooth.',
      timeAgo: '4 months ago',
      initials: 'JL',
      bgColor: 'bg-green-500'
    },
    {
      name: 'David K.',
      location: 'Plano, TX',
      rating: 5,
      text: 'Had to relocate for work urgently. NexStep offered a fair price and closed in 5 days. No realtor fees or hassles!',
      timeAgo: '3 weeks ago',
      initials: 'DK',
      bgColor: 'bg-purple-500'
    },
    {
      name: 'Linda P.',
      location: 'Houston, TX',
      rating: 5,
      text: 'Dealt with a difficult divorce situation. They were compassionate, professional, and made everything simple. Highly recommend!',
      timeAgo: '6 weeks ago',
      initials: 'LP',
      bgColor: 'bg-indigo-500'
    },
    {
      name: 'Robert T.',
      location: 'Austin, TX',
      rating: 5,
      text: 'Property had foundation issues and water damage. They still gave me a great offer and handled all the paperwork. Amazing service!',
      timeAgo: '2 weeks ago',
      initials: 'RT',
      bgColor: 'bg-orange-500'
    }
  ];

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": companyName,
          "image": "https://nexstephomebuyers.com/logo.png",
          "url": "https://nexstephomebuyers.com",
          "telephone": phoneNumber,
          "areaServed": `${metro} Metroplex`,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Main Street",
            "addressLocality": city,
            "addressRegion": state,
            "postalCode": "63101",
            "addressCountry": "US"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127"
          }
        })}
      </Script>

      <style jsx global>{`
        :root {
          --brand-bg: #0F1D3A;
          --brand-accent: #E21D2E;
          --text: #0A0A0A;
          --muted: #6B7280;
          --ok: #0EA5E9;
          --radius: 14px;
          --shadow: 0 10px 25px rgba(0,0,0,.08);
        }
      `}</style>

      {/* Hero Section */}
      <section id="hero" className="bg-gradient-to-br from-blue-900 to-blue-950 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Sell Your House for Cash in {city}
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Get a fair cash offer in 24 hours. No repairs needed, no fees, and we can close in as little as 7 days.
              </p>
              
              {/* Trust Badge */}
              <div className="mb-8">
                <div className="flex justify-center md:justify-start">
                  <div className="flex items-center bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                    <Shield className="w-5 h-5 mr-2 text-green-400" />
                    <span className="text-sm">Local {city} Company</span>
                  </div>
                </div>
              </div>

              {/* Mobile CTA Buttons */}
              <div className="lg:hidden flex gap-4 mb-8">
                <a 
                  href={`tel:${phoneNumber.replace(/[^\d]/g, '')}`}
                  onClick={handlePhoneClick}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </a>
                <a 
                  href={`sms:${phoneNumber.replace(/[^\d]/g, '')}`}
                  onClick={handleSmsClick}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Text Us
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Your Cash Offer</h2>
              <MultiStepForm onSubmit={handleFormSubmit} city={city} state={state} />
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      {isSticky && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Get My Cash Offer
          </button>
        </div>
      )}

      {/* Value Props */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Closing</h3>
              <p className="text-gray-600">Close in as little as 7 days or on your timeline</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Repairs Needed</h3>
              <p className="text-gray-600">We buy houses in any condition, as-is</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">We Pay Closing Costs</h3>
              <p className="text-gray-600">No fees, no commissions, no hidden costs</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Submit Property Info', desc: 'Fill out our simple form with your property details' },
              { step: 2, title: 'Get Your Offer', desc: 'Receive a fair cash offer within 24 hours' },
              { step: 3, title: 'Accept & Schedule', desc: 'Accept the offer and pick your closing date' },
              { step: 4, title: 'Get Paid', desc: 'Close on your timeline and get your cash' }
            ].map((item, index) => (
              <div key={item.step} className="text-center relative">
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
                {index < 3 && (
                  <ArrowRight className="hidden md:block absolute top-6 -right-4 w-8 h-8 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust and Certification Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">Trusted & Certified</h2>
            <div className="flex flex-wrap gap-8 justify-center items-center">
              <div className="flex items-center">
                <Image 
                  src="/5Star.png" 
                  alt="5 Star Rating" 
                  width={120} 
                  height={100} 
                  className="object-contain"
                />
              </div>
              <div className="flex items-center">
                <Image 
                  src="/SatGuar.png" 
                  alt="Satisfaction Guaranteed" 
                  width={120} 
                  height={100} 
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Sellers Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                {/* Review Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Profile Picture */}
                      <div className={`w-10 h-10 rounded-full ${testimonial.bgColor} flex items-center justify-center text-white font-semibold text-sm`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                        <p className="text-xs text-gray-500">{testimonial.location}</p>
                      </div>
                    </div>
                    {/* More Options */}
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Rating and Time */}
                <div className="px-4 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{testimonial.timeAgo}</span>
                  </div>
                </div>

                {/* Review Text */}
                <div className="px-4 pb-4">
                  <p className="text-gray-700 text-sm leading-relaxed">{testimonial.text}</p>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-end space-x-4">
                    <button className="text-xs text-gray-600 hover:text-blue-600">Helpful</button>
                    <button className="text-xs text-gray-600 hover:text-blue-600">Share</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Credibility */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">We Buy Houses in {city} Neighborhoods</h2>
          <p className="text-lg text-gray-600 mb-8">
            Serving the entire {metro} metroplex including Downtown {city}, Uptown, Oak Lawn, 
            Highland Park, Preston Hollow, Lake Highlands, and all surrounding areas.
          </p>
          <div className="flex items-center justify-center text-red-600">
            <MapPin className="w-6 h-6 mr-2" />
            <span className="font-semibold">Local {city} Company Since 2015</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="py-16 px-4 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Sell Your {city} House?</h2>
          <p className="text-xl mb-8">Get your no-obligation cash offer today. It only takes 2 minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-red-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-red-700 transition-colors inline-flex items-center justify-center"
            >
              Get My Cash Offer
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <a 
              href={`tel:${phoneNumber.replace(/[^\d]/g, '')}`}
              onClick={handlePhoneClick}
              className="bg-white text-blue-900 py-4 px-8 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              <Phone className="mr-2 w-5 h-5" />
              Call {phoneNumber}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default function OfferPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    }>
      <OfferPageContent />
    </Suspense>
  );
}