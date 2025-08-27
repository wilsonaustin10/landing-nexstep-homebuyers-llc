'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Responsive sizing */}
          <Link href="/" className="flex-shrink-0">
            <div className="relative w-[120px] sm:w-[200px] md:w-[250px] lg:w-[300px] h-[40px] sm:h-[50px] md:h-[60px] lg:h-[80px]">
              <Image
                src="/Nexstep Red White Blue 1024px.png"
                alt="NexStep HomeBuyers LLC"
                fill
                sizes="(max-width: 640px) 120px, (max-width: 768px) 200px, (max-width: 1024px) 250px, 300px"
                style={{ objectFit: 'contain' }}
                priority
                className="hover:opacity-90 transition-opacity"
              />
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-900 font-medium transition-colors text-sm xl:text-base"
            >
              Home
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-gray-700 hover:text-blue-900 font-medium transition-colors text-sm xl:text-base"
            >
              How It Works
            </Link>
            <Link 
              href="#testimonials" 
              className="text-gray-700 hover:text-blue-900 font-medium transition-colors text-sm xl:text-base"
            >
              Testimonials
            </Link>
          </nav>

          {/* CTA Button and Mobile Menu Button Container */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* CTA Button - Responsive sizing */}
            <Link
              href="/#property-form"
              className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm lg:text-base font-medium rounded shadow-sm text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all whitespace-nowrap"
            >
              <span className="hidden sm:inline">Get Your Offer</span>
              <span className="sm:hidden">Get Offer</span>
            </Link>

            {/* Mobile Menu Toggle - Visible on mobile/tablet */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50">
            <nav className="px-4 py-3 space-y-2">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50 transition-colors"
              >
                Home
              </Link>
              <Link 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50 transition-colors"
              >
                How It Works
              </Link>
              <Link 
                href="#testimonials" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50 transition-colors"
              >
                Testimonials
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 