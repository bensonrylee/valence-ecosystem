'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';
import { triggerHaptic } from '@/lib/ui-utils';

interface StripeConnectButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export default function StripeConnectButton({ onSuccess, className = '' }: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<{
    hasAccount: boolean;
    canAcceptPayments: boolean;
    detailsSubmitted?: boolean;
  } | null>(null);

  const checkAccountStatus = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        toast.error('Please log in to continue');
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch('/api/stripe/connect', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check account status');
      }

      const data = await response.json();
      setAccountStatus({
        hasAccount: data.hasStripeAccount,
        canAcceptPayments: data.canAcceptPayments,
        detailsSubmitted: data.detailsSubmitted,
      });

      return data;
    } catch (error) {
      console.error('Error checking account:', error);
      return null;
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    triggerHaptic();

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        toast.error('Please log in to continue');
        return;
      }

      const token = await user.getIdToken();
      
      // Create or retrieve Stripe Connect account
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create Stripe account');
      }

      const data = await response.json();

      if (data.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl;
      } else if (data.detailsSubmitted) {
        toast.success('Your payment account is already set up!');
        onSuccess?.();
      }

    } catch (error) {
      console.error('Stripe Connect error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect payment account');
    } finally {
      setLoading(false);
    }
  };

  // Check status on mount
  useEffect(() => {
    checkAccountStatus();
  }, []);

  if (accountStatus?.canAcceptPayments) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 ${className}`}>
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-green-900">Payment account active</h4>
          <p className="text-sm text-green-700 mt-1">
            You can accept payments and receive payouts
          </p>
        </div>
      </div>
    );
  }

  if (accountStatus?.hasAccount && accountStatus?.detailsSubmitted) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 ${className}`}>
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-900">Account verification pending</h4>
          <p className="text-sm text-yellow-700 mt-1">
            Stripe is reviewing your information. This usually takes 1-2 business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-xl">
          <CreditCard className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">Set up payments</h3>
          <p className="text-gray-600 mt-1">
            Connect your bank account to receive payments from customers
          </p>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Get paid directly to your bank account</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Secure payment processing by Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Daily automatic payouts available</span>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active-scale"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Connect with Stripe
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-3">
            By connecting, you agree to Stripe's terms and our platform fee of 7%
          </p>
        </div>
      </div>
    </div>
  );
}