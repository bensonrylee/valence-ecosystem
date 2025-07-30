'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, addDoc, collection, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BookingDocument, ServiceDocument, ReviewDocument } from '@/lib/firebase-collections';
import { Star, Send, ArrowLeft, Camera, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export default function CreateReviewPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<BookingDocument | null>(null);
  const [service, setService] = useState<ServiceDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      await loadBookingAndService(user.uid);
    });

    return () => unsubscribe();
  }, [bookingId, router]);

  const loadBookingAndService = async (userId: string) => {
    try {
      // Load booking
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      if (!bookingDoc.exists()) {
        toast.error('Booking not found');
        router.push('/bookings');
        return;
      }
      
      const bookingData = { id: bookingDoc.id, ...bookingDoc.data() } as BookingDocument;
      
      // Verify user is the buyer
      if (bookingData.buyerId !== userId) {
        toast.error('You can only review your own bookings');
        router.push('/bookings');
        return;
      }
      
      // Check if already reviewed
      if ('reviewed' in bookingData && bookingData.reviewed) {
        toast.error('You have already reviewed this booking');
        router.push('/bookings');
        return;
      }
      
      // Check if booking is completed
      if (bookingData.status !== 'completed') {
        toast.error('You can only review completed bookings');
        router.push('/bookings');
        return;
      }
      
      setBooking(bookingData);
      
      // Load service
      const serviceDoc = await getDoc(doc(db, 'services', bookingData.serviceId));
      if (serviceDoc.exists()) {
        setService({ id: serviceDoc.id, ...serviceDoc.data() } as ServiceDocument);
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking || !service) return;
    
    if (comment.trim().length < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      
      // Create review
      const reviewData: Omit<ReviewDocument, 'id'> = {
        bookingId: booking.id!,
        serviceId: service.id!,
        serviceName: service.name,
        providerId: booking.sellerId,
        providerName: booking.sellerName,
        buyerId: user.uid,
        buyerName: user.displayName || 'Anonymous',
        buyerAvatar: user.photoURL || '',
        rating,
        comment: comment.trim(),
        photos,
        helpful: [],
        verified: true, // Since they completed a booking
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addDoc(collection(db, 'reviews'), reviewData);
      
      // Update booking as reviewed
      await updateDoc(doc(db, 'bookings', booking.id!), {
        reviewed: true,
        reviewedAt: new Date()
      });
      
      // Update service rating
      const currentReviews = (service as any).totalReviews || 0;
      const currentRating = service.rating || 0;
      const newTotalReviews = currentReviews + 1;
      const newRating = ((currentRating * currentReviews) + rating) / newTotalReviews;
      
      await updateDoc(doc(db, 'services', service.id!), {
        rating: newRating,
        totalReviews: increment(1),
        updatedAt: new Date()
      });
      
      // Update provider rating
      await updateDoc(doc(db, 'providers', booking.sellerId), {
        'stats.totalReviews': increment(1),
        'stats.averageRating': newRating,
        updatedAt: new Date()
      });
      
      toast.success('Thank you for your review!');
      router.push('/bookings');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!booking || !service) return null;

  return (
    <div className="min-h-screen bg-dark p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="glass-panel p-6 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <h1 className="text-2xl font-bold text-white mb-2">Rate Your Experience</h1>
          <p className="text-gray-400">How was your session with {booking.sellerName}?</p>
        </div>

        {/* Service Info */}
        <div className="glass-panel p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-glass-light flex items-center justify-center">
              <Calendar className="w-8 h-8 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{service.name}</h3>
              <p className="text-gray-400 text-sm">
                {format(booking.bookingTime instanceof Date ? booking.bookingTime : new Date(booking.bookingTime as any), 'MMMM d, yyyy h:mm a')}
              </p>
              <p className="text-accent font-semibold">{formatCurrency(booking.amount)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Overall Rating</h2>
            <div className="flex items-center gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-gray-600'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-gray-400 mt-2">
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Very Good'}
              {rating === 3 && 'Good'}
              {rating === 2 && 'Fair'}
              {rating === 1 && 'Poor'}
            </p>
          </div>

          {/* Comment */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Write Your Review</h2>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="glass-input w-full h-32 resize-none"
              placeholder="Share your experience with others..."
              required
              minLength={10}
            />
            <p className="text-sm text-gray-400 mt-2">
              {comment.length}/500 characters (minimum 10)
            </p>
          </div>

          {/* Photos */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Add Photos (Optional)</h2>
            <div className="grid grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <button
                  type="button"
                  className="aspect-square glass-panel rounded-lg flex flex-col items-center justify-center hover:border-accent/30 transition-all"
                >
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">Add Photo</span>
                </button>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 glass-panel py-3 rounded-xl hover:border-gray-600 transition-all"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 glass-button-primary py-3 rounded-xl flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}