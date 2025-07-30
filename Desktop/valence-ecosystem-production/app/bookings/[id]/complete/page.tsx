'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CheckCircle, Star, MessageCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface BookingData {
  id: string;
  serviceName: string;
  serviceId: string;
  providerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  bookingTime: Date;
  completedAt?: Date;
  amount: number;
  status: string;
  reviewed?: boolean;
}

export default function BookingCompletePage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Check auth status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid || null);
      if (!user) {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      if (!currentUserId) return;
      
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);
        
        if (!bookingSnap.exists()) {
          toast.error('Booking not found');
          router.push('/bookings');
          return;
        }
        
        const data = bookingSnap.data();
        
        // Check if user is authorized to view this
        if (data.buyerId !== currentUserId && data.sellerId !== currentUserId) {
          toast.error('Unauthorized');
          router.push('/bookings');
          return;
        }
        
        // Convert timestamps
        const bookingData: BookingData = {
          id: bookingSnap.id,
          ...data,
          bookingTime: data.bookingTime?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
        } as BookingData;
        
        setBooking(bookingData);
        
        // Review is now handled on a separate page
        
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, currentUserId, router]);

  const handleReviewSuccess = () => {
    toast.success('Thank you for your review!');
    setBooking(prev => prev ? { ...prev, reviewed: true } : null);
  };

  const handleMessageProvider = () => {
    router.push(`/messages/${bookingId}`);
  };

  const handleBookAgain = () => {
    if (booking) {
      router.push(`/services/${booking.serviceId}`);
    }
  };

  const handleLeaveReview = () => {
    router.push(`/bookings/${bookingId}/review`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const isBuyer = currentUserId === booking.buyerId;
  const isCompleted = booking.status === 'completed';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isCompleted ? 'Service Completed!' : 'Booking Details'}
          </h1>
          
          {isCompleted && (
            <p className="text-gray-600">
              {isBuyer 
                ? 'We hope you had a great experience!' 
                : 'Great job! The service has been marked as complete.'}
            </p>
          )}
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Booking Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-medium text-gray-900">{booking.serviceName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-semibold text-gray-900 text-lg">
                  ${(booking.amount / 100).toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">
                  {isBuyer ? 'Provider' : 'Customer'}
                </p>
                <p className="font-medium text-gray-900">
                  {isBuyer ? booking.sellerName : booking.buyerName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium text-gray-900">
                  {format(booking.bookingTime, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="font-mono text-xs text-gray-500">{booking.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isCompleted 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Review Prompt for Buyers */}
          {isBuyer && isCompleted && !booking.reviewed && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How was your experience?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Your feedback helps other customers and helps {booking.sellerName} improve
              </p>
              <button
                onClick={handleLeaveReview}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Write a Review
              </button>
            </div>
          )}

          {/* Already Reviewed */}
          {isBuyer && isCompleted && booking.reviewed && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800">Thank you for leaving a review!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleMessageProvider}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Message</span>
            </button>
            
            {isBuyer && (
              <button
                onClick={handleBookAgain}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Again</span>
              </button>
            )}
          </div>

          {/* Return to Dashboard */}
          <button
            onClick={() => router.push(isBuyer ? '/bookings' : '/dashboard')}
            className="w-full text-center text-gray-600 hover:text-gray-900 py-2"
          >
            {isBuyer ? 'View All Bookings' : 'Back to Dashboard'}
          </button>
        </div>
      </div>

    </div>
  );
}