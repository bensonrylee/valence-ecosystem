'use client';

import { Star } from 'lucide-react';

interface ReviewSummaryProps {
  rating: number;
  totalReviews: number;
  distribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  categories?: {
    quality: number;
    communication: number;
    punctuality: number;
    value: number;
  };
}

export default function ReviewSummary({ 
  rating, 
  totalReviews, 
  distribution,
  categories 
}: ReviewSummaryProps) {
  
  // Calculate percentage for each rating
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  // Mock distribution if not provided
  const ratingDistribution = distribution || {
    5: Math.floor(totalReviews * 0.6),
    4: Math.floor(totalReviews * 0.25),
    3: Math.floor(totalReviews * 0.1),
    2: Math.floor(totalReviews * 0.03),
    1: Math.floor(totalReviews * 0.02),
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">{rating.toFixed(1)}</div>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          {categories && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Rating Breakdown</h3>
              {Object.entries(categories).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">
                    {key === 'quality' && 'Service Quality'}
                    {key === 'communication' && 'Communication'}
                    {key === 'punctuality' && 'Punctuality'}
                    {key === 'value' && 'Value for Money'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= Math.round(value)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-700 font-medium">{value.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDistribution[stars as keyof typeof ratingDistribution];
            const percentage = getPercentage(count);
            
            return (
              <div key={stars} className="flex items-center gap-3">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  <span>{stars}</span>
                  <Star className="w-3 h-3 fill-current" />
                </button>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}