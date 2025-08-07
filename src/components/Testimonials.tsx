'use client';

import React from 'react';
import { Star, User, MoreHorizontal } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  timeAgo: string;
  initials: string;
  bgColor: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Jason & Mary",
    location: "Dallas, TX",
    text: "We needed to sell our house fast due to a job relocation. NexStep HomeBuyers LLC helped us with a fair cash offer and closed in just 8 days!",
    rating: 5,
    timeAgo: "2 weeks ago",
    initials: "JM",
    bgColor: "bg-blue-500"
  },
  {
    name: "Robert Smith",
    location: "Cleveland, OH",
    text: "I inherited a property that needed too many repairs. NexStep HomeBuyers LLC bought it as-is and handled everything. No hassle, just cash in my pocket.",
    rating: 5,
    timeAgo: "1 month ago",
    initials: "RS",
    bgColor: "bg-green-500"
  },
  {
    name: "Sarah Johnson",
    location: "Jacksonville, FL",
    text: "After trying to sell with a realtor for 6 months, I contacted NexStep HomeBuyers LLC. They closed quickly and even covered all closing costs!",
    rating: 5,
    timeAgo: "3 months ago",
    initials: "SJ",
    bgColor: "bg-purple-500"
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">
          What Our Clients Say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
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
  );
} 