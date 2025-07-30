'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BookingDocument, ServiceDocument, ReviewDocument } from '@/lib/firebase-collections';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Star, 
  Clock,
  Users,
  Package,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingEarnings: number;
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  averageRating: number;
  totalReviews: number;
  activeServices: number;
  monthlyGrowth: number;
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: 'up' | 'down';
  trendValue?: string;
}) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-accent' : 'text-red-400'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-accent/10 text-accent`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function ProviderDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingEarnings: 0,
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    averageRating: 0,
    totalReviews: 0,
    activeServices: 0,
    monthlyGrowth: 0,
  });
  const [recentBookings, setRecentBookings] = useState<BookingDocument[]>([]);
  const [topServices, setTopServices] = useState<ServiceDocument[]>([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Check if user is a provider
      const providerDoc = await getDoc(doc(db, 'providers', user.uid));
      if (!providerDoc.exists()) {
        router.push('/become-provider');
        return;
      }

      await loadDashboardData(user.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadDashboardData = async (providerId: string) => {
    try {
      setLoading(true);

      // Get date ranges
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // Fetch bookings
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('sellerId', '==', providerId),
        orderBy('createdAt', 'desc')
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = bookingsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as BookingDocument));

      // Calculate stats
      let totalEarnings = 0;
      let monthlyEarnings = 0;
      let lastMonthEarnings = 0;
      let pendingEarnings = 0;
      let upcomingBookings = 0;
      let completedBookings = 0;

      bookings.forEach(booking => {
        const bookingDate = booking.createdAt instanceof Date ? booking.createdAt : new Date(booking.createdAt as any);
        
        if (booking.status === 'completed') {
          totalEarnings += booking.providerPayout || 0;
          completedBookings++;
          
          if (bookingDate >= monthStart && bookingDate <= monthEnd) {
            monthlyEarnings += booking.providerPayout || 0;
          }
          if (bookingDate >= lastMonthStart && bookingDate <= lastMonthEnd) {
            lastMonthEarnings += booking.providerPayout || 0;
          }
        } else if (booking.status === 'confirmed') {
          pendingEarnings += booking.providerPayout || 0;
          const bTime = booking.bookingTime instanceof Date ? booking.bookingTime : new Date(booking.bookingTime as any);
          if (bTime > now) {
            upcomingBookings++;
          }
        }
      });

      // Calculate growth
      const monthlyGrowth = lastMonthEarnings > 0 
        ? ((monthlyEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
        : 0;

      // Fetch services
      const servicesQuery = query(
        collection(db, 'services'),
        where('providerId', '==', providerId),
        where('active', '==', true)
      );
      const servicesSnapshot = await getDocs(servicesQuery);
      const services = servicesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as ServiceDocument));

      // Fetch reviews
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('providerId', '==', providerId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviews = reviewsSnapshot.docs.map(doc => doc.data() as ReviewDocument);

      // Calculate average rating
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      setStats({
        totalEarnings,
        monthlyEarnings,
        pendingEarnings,
        totalBookings: bookings.length,
        upcomingBookings,
        completedBookings,
        averageRating,
        totalReviews: reviews.length,
        activeServices: services.length,
        monthlyGrowth,
      });

      setRecentBookings(bookings.slice(0, 5));
      setTopServices(services.sort((a, b) => b.completedBookings - a.completedBookings).slice(0, 3));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Provider Dashboard</h1>
              <p className="text-gray-400 mt-1">Monitor your performance and earnings</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/dashboard/services"
                className="glass-button px-4 py-2 rounded-lg text-white hover:bg-glass-medium transition-all"
              >
                Manage Services
              </Link>
              <Link 
                href="/dashboard/payments"
                className="px-4 py-2 rounded-lg bg-accent text-dark font-medium hover:bg-accent-500 transition-all"
              >
                Payment Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Monthly Earnings" 
            value={`$${(stats.monthlyEarnings / 100).toFixed(2)}`}
            icon={DollarSign}
            trend={stats.monthlyGrowth >= 0 ? 'up' : 'down'}
            trendValue={`${Math.abs(stats.monthlyGrowth).toFixed(1)}%`}
          />
          <StatCard 
            title="Upcoming Bookings" 
            value={stats.upcomingBookings}
            icon={Calendar}
          />
          <StatCard 
            title="Average Rating" 
            value={stats.averageRating.toFixed(1)}
            icon={Star}
          />
          <StatCard 
            title="Active Services" 
            value={stats.activeServices}
            icon={Package}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Earnings Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Earnings</span>
                <span className="text-white font-medium">${(stats.totalEarnings / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Pending Payouts</span>
                <span className="text-accent font-medium">${(stats.pendingEarnings / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">This Month</span>
                <span className="text-white font-medium">${(stats.monthlyEarnings / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Booking Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Bookings</span>
                <span className="text-white font-medium">{stats.totalBookings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Completed</span>
                <span className="text-white font-medium">{stats.completedBookings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Completion Rate</span>
                <span className="text-accent font-medium">
                  {stats.totalBookings > 0 
                    ? `${((stats.completedBookings / stats.totalBookings) * 100).toFixed(0)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Customer Satisfaction</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-white font-medium">{stats.averageRating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Reviews</span>
                <span className="text-white font-medium">{stats.totalReviews}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Response Rate</span>
                <span className="text-accent font-medium">98%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings & Top Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
              <Link href="/dashboard/bookings" className="text-accent text-sm hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-glass-white">
                    <div className="flex-1">
                      <p className="text-white font-medium">{booking.serviceName}</p>
                      <p className="text-gray-400 text-sm">{booking.buyerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${(booking.amount / 100).toFixed(2)}</p>
                      <p className="text-gray-400 text-sm">
                        {format(booking.bookingTime instanceof Date ? booking.bookingTime : new Date(booking.bookingTime as any), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No recent bookings</p>
              )}
            </div>
          </div>

          {/* Top Services */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Top Services</h3>
              <Link href="/dashboard/services" className="text-accent text-sm hover:underline">
                Manage all
              </Link>
            </div>
            <div className="space-y-3">
              {topServices.length > 0 ? (
                topServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 rounded-lg bg-glass-white">
                    <div className="flex-1">
                      <p className="text-white font-medium">{service.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-accent fill-accent" />
                          <span className="text-gray-400 text-sm">{service.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {service.completedBookings} bookings
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${(service.price / 100).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No services yet</p>
                  <Link 
                    href="/dashboard/services/new"
                    className="inline-flex items-center gap-2 text-accent hover:underline"
                  >
                    <Package className="w-4 h-4" />
                    Create your first service
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}