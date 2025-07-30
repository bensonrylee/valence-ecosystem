'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import Link from 'next/link';

interface Transaction {
  id: string;
  paymentIntentId: string;
  bookingId: string;
  totalAmount: number;
  platformFee: number;
  providerAmount: number;
  status: string;
  createdAt: Date;
}

interface PaymentStats {
  totalEarnings: number;
  pendingPayouts: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  totalTransactions: number;
}

export default function PaymentsDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalEarnings: 0,
    pendingPayouts: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      await loadPaymentData(user.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadPaymentData = async (userId: string) => {
    try {
      // Check Stripe connection status
      const response = await fetch('/api/stripe/connect', {
        headers: {
          'Authorization': `Bearer ${await getAuth().currentUser?.getIdToken()}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStripeConnected(data.hasStripeAccount && data.canAcceptPayments);
      }

      // Load transactions
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('providerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      } as Transaction));
      
      setTransactions(transactionsData);
      
      // Calculate stats
      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      
      let totalEarnings = 0;
      let thisMonthEarnings = 0;
      let lastMonthEarnings = 0;
      
      transactionsData.forEach(transaction => {
        if (transaction.status === 'succeeded') {
          totalEarnings += transaction.providerAmount;
          
          if (transaction.createdAt >= thisMonthStart) {
            thisMonthEarnings += transaction.providerAmount;
          } else if (transaction.createdAt >= lastMonthStart && transaction.createdAt <= lastMonthEnd) {
            lastMonthEarnings += transaction.providerAmount;
          }
        }
      });
      
      setStats({
        totalEarnings,
        pendingPayouts: 0, // This would come from Stripe balance API
        thisMonthEarnings,
        lastMonthEarnings,
        totalTransactions: transactionsData.length,
      });
      
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    const user = getAuth().currentUser;
    if (user) {
      await loadPaymentData(user.uid);
    }
    setRefreshing(false);
  };

  const downloadReport = () => {
    // Implementation for downloading CSV report
    console.log('Download report');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!stripeConnected) {
    return (
      <div className="min-h-screen bg-dark p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Stripe Account</h2>
            <p className="text-gray-400 mb-6">
              You need to connect your Stripe account to start accepting payments and view your earnings.
            </p>
            <Link
              href="/onboarding/stripe"
              className="glass-button-primary px-6 py-3 rounded-xl inline-flex items-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Connect Stripe Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-panel p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Payments</h1>
              <p className="text-gray-400">Track your earnings and transactions</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="glass-panel px-4 py-2 rounded-lg hover:border-accent/30 transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={downloadReport}
                className="glass-panel px-4 py-2 rounded-lg hover:border-accent/30 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-10 h-10 text-green-500" />
              <span className="text-xs text-gray-400">All Time</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {formatCurrency(stats.totalEarnings / 100)}
            </h3>
            <p className="text-gray-400 text-sm mt-1">Total Earnings</p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 text-yellow-500" />
              <span className="text-xs text-gray-400">Pending</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {formatCurrency(stats.pendingPayouts / 100)}
            </h3>
            <p className="text-gray-400 text-sm mt-1">Next Payout</p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 text-blue-500" />
              <span className="text-xs text-gray-400">This Month</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {formatCurrency(stats.thisMonthEarnings / 100)}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {stats.thisMonthEarnings > stats.lastMonthEarnings ? '+' : ''}
              {Math.round(((stats.thisMonthEarnings - stats.lastMonthEarnings) / stats.lastMonthEarnings) * 100)}%
            </p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-10 h-10 text-purple-500" />
              <span className="text-xs text-gray-400">Count</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.totalTransactions}</h3>
            <p className="text-gray-400 text-sm mt-1">Total Transactions</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link
            href="/dashboard/payments/transactions"
            className="glass-panel p-4 hover:border-accent/30 transition-all flex items-center justify-between"
          >
            <div>
              <h3 className="text-white font-semibold">View All Transactions</h3>
              <p className="text-gray-400 text-sm">Detailed transaction history</p>
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            href="/dashboard/payments/payouts"
            className="glass-panel p-4 hover:border-accent/30 transition-all flex items-center justify-between"
          >
            <div>
              <h3 className="text-white font-semibold">Payout Schedule</h3>
              <p className="text-gray-400 text-sm">Manage your payouts</p>
            </div>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            href="/dashboard/payments/settings"
            className="glass-panel p-4 hover:border-accent/30 transition-all flex items-center justify-between"
          >
            <div>
              <h3 className="text-white font-semibold">Payment Settings</h3>
              <p className="text-gray-400 text-sm">Update bank details</p>
            </div>
            <CreditCard className="w-5 h-5 text-gray-400" />
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
          
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-dark-border">
                    <th className="pb-3 text-gray-400 font-medium">Date</th>
                    <th className="pb-3 text-gray-400 font-medium">Booking ID</th>
                    <th className="pb-3 text-gray-400 font-medium">Amount</th>
                    <th className="pb-3 text-gray-400 font-medium">Fee</th>
                    <th className="pb-3 text-gray-400 font-medium">Net</th>
                    <th className="pb-3 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id} className="border-b border-dark-border">
                      <td className="py-4 text-white">
                        {format(transaction.createdAt, 'MMM d, yyyy')}
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/bookings/${transaction.bookingId}`}
                          className="text-accent hover:underline"
                        >
                          #{transaction.bookingId.slice(-8)}
                        </Link>
                      </td>
                      <td className="py-4 text-white">
                        {formatCurrency(transaction.totalAmount / 100)}
                      </td>
                      <td className="py-4 text-gray-400">
                        -{formatCurrency(transaction.platformFee / 100)}
                      </td>
                      <td className="py-4 text-white font-semibold">
                        {formatCurrency(transaction.providerAmount / 100)}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 text-sm ${
                          transaction.status === 'succeeded' 
                            ? 'text-green-500' 
                            : 'text-yellow-500'
                        }`}>
                          {transaction.status === 'succeeded' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {transactions.length > 10 && (
            <div className="mt-4 text-center">
              <Link
                href="/dashboard/payments/transactions"
                className="text-accent hover:underline text-sm"
              >
                View all transactions →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}