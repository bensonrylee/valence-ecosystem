'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, sendVerificationEmail, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is already verified
    if (currentUser?.emailVerified) {
      router.push('/explore');
    }
  }, [currentUser, router]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setError('');
    setResendSuccess(false);
    
    try {
      await sendVerificationEmail();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div>
          <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verify your email
          </h2>
          
          <p className="mt-2 text-gray-600">
            We&apos;ve sent a verification email to
          </p>
          
          <p className="font-medium text-gray-900">
            {currentUser?.email}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Please check your inbox and click the verification link to activate your account.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          {resendSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
            >
              Verification email sent successfully!
            </motion.div>
          )}

          <div className="pt-4 space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isResending ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Resend verification email'
              )}
            </motion.button>

            <button
              onClick={handleLogout}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Sign in with a different account
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If you don&apos;t see the email, check your spam folder or make sure{' '}
            <span className="font-medium">noreply@valenceecosystem.com</span> is added to your contacts.
          </p>
        </div>
      </motion.div>
    </div>
  );
}