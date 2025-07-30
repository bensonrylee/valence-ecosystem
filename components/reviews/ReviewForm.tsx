'use client';

import React, { useState } from 'react';
import { Star, Camera, X } from 'lucide-react';
import { Card } from '@/components/ui/primitives/Card';
import { Button } from '@/components/ui/primitives/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewFormProps {
  bookingId: string;
  serviceTitle: string;
  providerName: string;
  onSubmit: (review: {
    rating: number;
    comment: string;
    images?: File[];
  }) => Promise<void>;
  onCancel: () => void;
}

export function ReviewForm({
  bookingId,
  serviceTitle,
  providerName,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        comment,
        images: images.length > 0 ? images : undefined,
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages([...images, ...files].slice(0, 3)); // Max 3 images
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const ratingLabels = ['Terrible', 'Poor', 'Average', 'Very Good', 'Excellent'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">How was your experience?</h2>
          <p className="text-gray-400">
            {serviceTitle} with {providerName}
          </p>
        </div>

        {/* Star Rating */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-colors"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-[#00FFAD] text-[#00FFAD]'
                      : 'text-gray-600'
                  }`}
                />
              </motion.button>
            ))}
          </div>
          {(hoveredRating || rating) > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#00FFAD] font-medium"
            >
              {ratingLabels[(hoveredRating || rating) - 1]}
            </motion.p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tell us more (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike about this service?"
            className="w-full glass-input min-h-[120px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {comment.length}/500
          </p>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Add photos (optional)
          </label>
          <div className="flex gap-3">
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Review image ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
            {images.length < 3 && (
              <label className="w-20 h-20 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#00FFAD] transition-colors">
                <Camera className="w-6 h-6 text-gray-400" />
                <span className="sr-only">Upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload review images"
                />
              </label>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            loading={isSubmitting}
            className="flex-1"
          >
            Submit Review
          </Button>
        </div>

        {rating === 5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-[#00FFAD]/10 rounded-xl text-center"
          >
            <p className="text-sm text-[#00FFAD]">
              🎉 Glad you had a great experience! Would you like to refer a friend?
            </p>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}