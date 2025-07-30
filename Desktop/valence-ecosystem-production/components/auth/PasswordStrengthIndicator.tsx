'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const calculateStrength = (pass: string): number => {
    let strength = 0;
    
    if (pass.length >= 8) strength++;
    if (pass.length >= 12) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    
    return strength;
  };

  const strength = calculateStrength(password);
  
  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength] || 'Very Weak';
  const strengthColor = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500'
  ][strength] || 'bg-gray-300';

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: index < strength ? 1 : 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`h-1 flex-1 rounded-full origin-left ${
              index < strength ? strengthColor : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${strength >= 3 ? 'text-green-600' : 'text-gray-500'}`}>
        Password strength: {strengthText}
      </p>
    </div>
  );
}