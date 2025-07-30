'use client';

import React, { useState, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface FloatingLabelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function FloatingLabelInput({
  label,
  error,
  id,
  type = 'text',
  value,
  onChange,
  ...props
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;

  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full px-4 pt-6 pb-2 bg-white border rounded-lg
          transition-all duration-200 ease-out
          ${error 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:border-blue-600'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-600/20
          peer
        `}
        placeholder=" "
        {...props}
      />
      <motion.label
        htmlFor={id}
        animate={{
          scale: isFocused || hasValue ? 0.85 : 1,
          y: isFocused || hasValue ? -12 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`
          absolute left-4 top-4 text-gray-500 pointer-events-none
          origin-left transition-colors duration-200
          ${(isFocused || hasValue) ? 'text-sm' : 'text-base'}
          ${isFocused ? 'text-blue-600' : ''}
          ${error ? 'text-red-500' : ''}
        `}
      >
        {label}
      </motion.label>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}