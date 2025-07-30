'use client';

import { useState } from 'react';
import { DollarSign, Calendar, CreditCard, TrendingUp, ChevronRight, Info, Download, ExternalLink, Clock } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface PaymentSettingsProps {
  accountData: {
    balance?: {
      available: number;
      pending: number;
    };
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
  };
}

export default function PaymentSettings({ accountData }: PaymentSettingsProps) {
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const handleUpdateBankingDetails = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        toast.error('Please log in to continue');
        return;
      }

      const token = await user.getIdToken();
      
      // Create a new onboarding session to update bank details
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create update session');
      }

      const data = await response.json();
      
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    } catch (error) {
      console.error('Error updating banking details:', error);
      toast.error('Failed to update banking details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Balance</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Available Balance</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(accountData.balance?.available || 0)}
            </div>
            <p className="text-sm text-gray-500 mt-2">Ready for payout</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Pending Balance</span>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(accountData.balance?.pending || 0)}
            </div>
            <p className="text-sm text-gray-500 mt-2">Processing payments</p>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              Pending payments typically become available within 2-7 business days, depending on the payment method used by your customers.
            </p>
          </div>
        </div>
      </div>

      {/* Payout Schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Payout Schedule</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Daily automatic payouts</p>
                <p className="text-sm text-gray-600">Your available balance is transferred daily</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Instant payouts</p>
                <p className="text-sm text-gray-600">Get funds within minutes for a small fee</p>
              </div>
            </div>
            <Link
              href="#"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>

      {/* Banking Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Banking Details</h2>
          <button
            onClick={handleUpdateBankingDetails}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 disabled:opacity-50"
          >
            Update
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Bank account</p>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">•••• •••• •••• 4242</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Account holder</p>
            <p className="font-medium text-gray-900">Your verified business name</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Routing number</p>
            <p className="font-medium text-gray-900">•••••6789</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Your banking information is securely stored and encrypted by Stripe. We never have access to your full account details.
          </p>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Payouts</h2>
          <Link
            href="/dashboard/payments/history"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {/* Example payout entries */}
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Download className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Daily payout</p>
                <p className="text-sm text-gray-600">Jan 29, 2025</p>
              </div>
            </div>
            <span className="font-medium text-gray-900">$450.00</span>
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Download className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Daily payout</p>
                <p className="text-sm text-gray-600">Jan 28, 2025</p>
              </div>
            </div>
            <span className="font-medium text-gray-900">$325.50</span>
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Download className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Daily payout</p>
                <p className="text-sm text-gray-600">Jan 27, 2025</p>
              </div>
            </div>
            <span className="font-medium text-gray-900">$275.00</span>
          </div>
        </div>
      </div>

      {/* Platform Fee Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Platform fee: 7%</p>
            <p>
              We deduct a 7% platform fee from each transaction to cover payment processing, customer support, and platform maintenance. The amounts shown above are after fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}