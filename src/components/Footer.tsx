import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/Nexstep Red White Blue 1024px.png"
                alt="NexStep HomeBuyers LLC"
                width={120}
                height={120}
                className="mr-2"
              />
            </div>
            <p className="text-gray-600">
              We buy houses in any condition. Get your fair cash offer today.
            </p>
            <div className="space-y-2">
              <a 
                href="tel:6362385598"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-900 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>(636) 238-5598</span>
              </a>
              <a 
                href="mailto:info@homesellrescue.com"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-900 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>info@homesellrescue.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#how-it-works" className="text-gray-600 hover:text-blue-900 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="text-gray-600 hover:text-blue-900 transition-colors">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Offered */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Specializing In</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">Pre-Foreclosure</li>
              <li className="text-gray-600">Divorce</li>
              <li className="text-gray-600">Storm Damage</li>
              <li className="text-gray-600">Tax Liens</li>
              <li className="text-gray-600">Bad Tenants</li>
              <li className="text-gray-600">Code Violations</li>
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Get Started</h3>
            <p className="text-gray-600 mb-4">
              Ready to sell your house? Get your cash offer today!
            </p>
            <Link
              href="/"
              className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Get Your Offer
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>© {new Date().getFullYear()} NexStep HomeBuyers LLC. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-blue-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-900 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 
