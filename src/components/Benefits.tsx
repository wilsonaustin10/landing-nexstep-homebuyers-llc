import React from 'react'
import { CheckCircle } from 'lucide-react'

interface BenefitsProps {
  className?: string;
}

export function Benefits({ className }: BenefitsProps) {
  const benefits = [
    "We buy houses in any condition",
    "No obligation offer",
    "No fees",
    "Confidential",
    "No repairs necessary",
    "We pay closing costs"
  ]

  return (
    <div className={`max-w-3xl mx-auto my-16 px-4 text-center ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex flex-col items-center justify-center space-y-2 text-xl font-bold">
            <div className="relative">
              <CheckCircle className="h-8 w-8 text-white stroke-[2.5] drop-shadow-[0_0_3px_rgba(0,0,0,0.3)]" />
            </div>
            <span className="text-white text-2xl font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

