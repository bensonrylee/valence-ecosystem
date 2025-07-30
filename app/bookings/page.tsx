'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Calendar, Clock, MapPin, MessageSquare, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useClerkAuth';

// Mock bookings data
const mockBookings = [
  {
    id: '1',
    service: 'Professional Yoga Instruction',
    provider: {
      name: 'Sarah Johnson',
      image: '/api/placeholder/50/50',
    },
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    time: '10:00 AM',
    duration: 60,
    price: 80.25, // Including platform fee
    status: 'confirmed',
    location: 'Downtown Studio',
  },
  {
    id: '2',
    service: 'Business Consulting',
    provider: {
      name: 'Michael Chen',
      image: '/api/placeholder/50/50',
    },
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    time: '2:00 PM',
    duration: 90,
    price: 160.50,
    status: 'confirmed',
    location: 'Virtual Meeting',
  },
  {
    id: '3',
    service: 'Personal Training',
    provider: {
      name: 'Alex Rivera',
      image: '/api/placeholder/50/50',
    },
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    time: '6:00 PM',
    duration: 60,
    price: 85.60,
    status: 'completed',
    location: 'Fitness Center',
  },
];

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  const upcomingBookings = mockBookings.filter(
    booking => booking.date >= new Date() && booking.status !== 'cancelled'
  );
  
  const pastBookings = mockBookings.filter(
    booking => booking.date < new Date() || booking.status === 'cancelled'
  );

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view your bookings</h2>
          <Link
            href="/auth/sign-in"
            className="inline-block px-6 py-3 bg-[#00FFAD] text-gray-900 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Booking confirmed successfully!
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">My Bookings</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'upcoming'
                ? 'text-[#00FFAD] border-b-2 border-[#00FFAD]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'past'
                ? 'text-[#00FFAD] border-b-2 border-[#00FFAD]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Past ({pastBookings.length})
          </button>
        </div>
        
        {/* Bookings List */}
        {displayBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No {activeTab} bookings
            </h3>
            <p className="text-gray-400 mb-6">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming bookings yet." 
                : "You don't have any past bookings."}
            </p>
            {activeTab === 'upcoming' && (
              <Link
                href="/explore"
                className="inline-block px-6 py-3 bg-[#00FFAD] text-gray-900 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all"
              >
                Explore Services
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayBookings.map((booking) => (
              <div key={booking.id} className="glass-panel p-6 hover:bg-white/10 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0"></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {booking.service}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        with {booking.provider.name}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center text-gray-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          {booking.date.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          {booking.time} ({booking.duration} min)
                        </div>
                        <div className="flex items-center text-gray-400">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-[#00FFAD] font-semibold text-lg">
                      ${booking.price.toFixed(2)}
                    </div>
                    <div className="flex gap-2">
                      {booking.status === 'confirmed' && activeTab === 'upcoming' && (
                        <>
                          <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                            Cancel
                          </button>
                          <button className="px-4 py-2 bg-[#00FFAD] text-gray-900 rounded-lg hover:bg-[#00FF8C] transition-colors text-sm font-semibold flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Message
                          </button>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                          Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}