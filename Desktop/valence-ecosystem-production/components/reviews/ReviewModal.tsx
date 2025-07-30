'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';
import { triggerHaptic } from '@/lib/ui-utils';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    serviceName: string;
    providerName: string;
    serviceId: string;
    providerId: string;
  };
  onSuccess?: () => void;
}

interface RatingCategory {
  label: string;
  key: 'quality' | 'communication' | 'punctuality' | 'value';
  value: number;
}

export default function ReviewModal({ isOpen, onClose, booking, onSuccess }: ReviewModalProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [categories, setCategories] = useState<RatingCategory[]>([
    { label: 'Service Quality', key: 'quality', value: 0 },
    { label: 'Communication', key: 'communication', value: 0 },
    { label: 'Punctuality', key: 'punctuality', value: 0 },
    { label: 'Value for Money', key: 'value', value: 0 },
  ]);

  if (!isOpen) return null;

  // Emoji feedback based on rating
  const getRatingEmoji = (rating: number) => {
    switch (rating) {
      case 1: return { emoji: '😟', text: 'Poor' };
      case 2: return { emoji: '😐', text: 'Fair' };
      case 3: return { emoji: '🙂', text: 'Good' };
      case 4: return { emoji: '😊', text: 'Great' };
      case 5: return { emoji: '🤩', text: 'Excellent!' };
      default: return { emoji: '', text: '' };
    }
  };

  const handleRatingClick = (rating: number) => {
    setOverallRating(rating);
    triggerHaptic();
    
    // Show confetti for 5 stars
    if (rating === 5) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    
    // Auto-fill categories if not set
    if (categories.every(cat => cat.value === 0)) {
      setCategories(categories.map(cat => ({ ...cat, value: rating })));
    }
  };

  const handleCategoryRating = (index: number, rating: number) => {
    const updated = [...categories];
    updated[index].value = rating;
    setCategories(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (overallRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (comment.length < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error('You must be logged in');
        return;
      }

      const token = await currentUser.getIdToken();

      const categoryRatings = categories.reduce((acc, cat) => {
        if (cat.value > 0) {
          acc[cat.key] = cat.value;
        }
        return acc;
      }, {} as Record<string, number>);

      const response = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          rating: overallRating,
          comment,
          categories: categoryRatings,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      toast.success('Review submitted successfully!');
      
      // Reset form
      setOverallRating(0);
      setComment('');
      setCategories(categories.map(cat => ({ ...cat, value: 0 })));
      
      onSuccess?.();
      onClose();
      
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    rating, 
    onRate, 
    size = 'lg',
    hoverable = true 
  }: { 
    rating: number; 
    onRate: (rating: number) => void;
    size?: 'sm' | 'lg';
    hoverable?: boolean;
  }) => {
    const [hovered, setHovered] = useState(0);
    const starSize = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              onRate(star);
              triggerHaptic(5);
            }}
            onMouseEnter={() => hoverable && setHovered(star)}
            onMouseLeave={() => hoverable && setHovered(0)}
            className={`transition-all duration-200 hover:scale-110 ${
              star === rating ? 'animate-star-burst' : ''
            }`}
          >
            <Star
              className={`${starSize} ${
                star <= (hovered || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              } transition-all duration-200`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#fbbf24', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#10b981'][Math.floor(Math.random() * 6)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
        onClick={onClose}
      >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Rate your experience</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service info */}
          <div className="text-center pb-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 text-lg">{booking.serviceName}</h3>
            <p className="text-gray-600">with {booking.providerName}</p>
          </div>

          {/* Overall rating */}
          <div className="text-center space-y-4">
            <p className="text-gray-700 font-medium">How was your overall experience?</p>
            <div className="flex justify-center">
              <StarRating
                rating={overallRating}
                onRate={handleRatingClick}
                size="lg"
              />
            </div>
            {overallRating > 0 && (
              <div className="animate-fade-in-scale">
                <div className="text-5xl mb-2">
                  {getRatingEmoji(overallRating).emoji}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {getRatingEmoji(overallRating).text}
                </p>
              </div>
            )}
          </div>

          {/* Category ratings */}
          {overallRating > 0 && (
            <div className="space-y-3 py-4 border-y border-gray-100">
              <p className="text-sm text-gray-700 font-medium mb-4">Rate specific aspects (optional)</p>
              {categories.map((category, index) => (
                <div key={category.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{category.label}</span>
                  <StarRating
                    rating={category.value}
                    onRate={(rating) => handleCategoryRating(index, rating)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Comment */}
          {overallRating > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us more about your experience
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
                minLength={10}
                maxLength={500}
                placeholder="What did you like or dislike? Your feedback helps other customers and the provider..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
              <p className={`text-xs mt-1 text-right transition-colors duration-200 ${
                comment.length < 10 ? 'text-red-500' : 
                comment.length > 400 ? 'text-orange-500' : 
                'text-gray-500'
              }`}>
                {comment.length}/500 characters
                {comment.length < 10 && ' (min 10)'}
              </p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || overallRating === 0 || comment.length < 10}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed active-scale"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>

          {/* Privacy note */}
          <p className="text-xs text-gray-500 text-center">
            Your review will be publicly visible. We'll never share your personal information.
          </p>
        </form>
      </div>
    </div>
    </>
  );
}