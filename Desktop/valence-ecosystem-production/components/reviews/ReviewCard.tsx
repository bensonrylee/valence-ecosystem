'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, CheckCircle, MessageCircle } from 'lucide-react';
import { ReviewDocument } from '@/lib/firebase-collections';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: ReviewDocument;
  showProviderResponse?: boolean;
  onHelpful?: (reviewId: string) => void;
  currentUserId?: string;
}

export default function ReviewCard({ 
  review, 
  showProviderResponse = true,
  onHelpful,
  currentUserId
}: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLongReview = review.comment.length > 200;
  const displayComment = expanded ? review.comment : review.comment.slice(0, 200);
  
  // Check if current user found this helpful
  const userFoundHelpful = currentUserId ? review.helpful?.includes(currentUserId) : false;
  
  // Generate initials fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleHelpful = () => {
    if (onHelpful && !userFoundHelpful) {
      onHelpful(review.id || '');
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
      {/* Reviewer info */}
      <div className="flex items-start gap-3 mb-3">
        {review.buyerAvatar ? (
          <Image
            src={review.buyerAvatar}
            alt={review.buyerName}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {getInitials(review.buyerName)}
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-900">{review.buyerName}</h4>
            {review.verified && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Verified booking</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span>•</span>
            <span>
              {review.createdAt && formatDistanceToNow(
                review.createdAt instanceof Date 
                  ? review.createdAt 
                  : (review.createdAt as any).toDate ? (review.createdAt as any).toDate() : new Date(review.createdAt as any),
                { addSuffix: true }
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Category ratings if available */}
      {(review as any).categories && Object.keys((review as any).categories).length > 0 && (
        <div className="flex flex-wrap gap-4 mb-3 text-sm">
          {Object.entries((review as any).categories).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= (value as number)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review comment */}
      <p className="text-gray-700 leading-relaxed">
        {displayComment}
        {isLongReview && !expanded && '...'}
      </p>
      
      {isLongReview && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Review photos if any */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {review.photos.map((photo, index) => (
            <div key={index} className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={photo}
                alt={`Review photo ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handleHelpful}
          disabled={userFoundHelpful}
          className={`flex items-center gap-2 text-sm ${
            userFoundHelpful
              ? 'text-blue-600 cursor-default'
              : 'text-gray-600 hover:text-gray-900'
          } transition-colors`}
        >
          <ThumbsUp className={`w-4 h-4 ${userFoundHelpful ? 'fill-current' : ''}`} />
          <span>
            Helpful {review.helpful && review.helpful.length > 0 && `(${review.helpful.length})`}
          </span>
        </button>
      </div>

      {/* Provider response */}
      {showProviderResponse && review.providerResponse && (
        <div className="mt-4 ml-12 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-900 text-sm">Response from {review.providerName}</span>
          </div>
          <p className="text-gray-700 text-sm">{review.providerResponse.text}</p>
          {review.providerResponse.respondedAt && (
            <p className="text-xs text-gray-500 mt-2">
              {formatDistanceToNow(
                review.providerResponse.respondedAt instanceof Date 
                  ? review.providerResponse.respondedAt 
                  : (review.providerResponse.respondedAt as any).toDate ? (review.providerResponse.respondedAt as any).toDate() : new Date(review.providerResponse.respondedAt as any),
                { addSuffix: true }
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}