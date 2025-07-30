'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';

interface CompleteBookingButtonProps {
  bookingId: string;
  onComplete?: () => void;
  className?: string;
}

export default function CompleteBookingButton({ 
  bookingId, 
  onComplete,
  className = ''
}: CompleteBookingButtonProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    const confirmComplete = window.confirm(
      'Mark this service as completed? This will notify the customer to leave a review.'
    );
    
    if (!confirmComplete) return;

    setIsCompleting(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast.error('You must be logged in');
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch('/api/bookings/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete booking');
      }

      toast.success('Service marked as complete! Customer has been notified.');
      onComplete?.();
      
    } catch (error) {
      console.error('Complete booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete booking');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <button
      onClick={handleComplete}
      disabled={isCompleting}
      className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <CheckCircle className="w-4 h-4" />
      <span>{isCompleting ? 'Completing...' : 'Mark as Complete'}</span>
    </button>
  );
}