'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { generateTimeSlots, formatTimeSlot, combineDateAndTime } from '@/lib/calendar';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    name: string;
    price: number;
    providerId: string;
    providerName: string;
  };
  providerId: string;
}

export default function BookingModal({ isOpen, onClose, service, providerId }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimes([]);
      setSelectedTime('');
      return;
    }

    let cancelled = false;

    const fetchBlockedSlots = async () => {
      setIsLoadingSlots(true);
      setSelectedTime(''); // Reset time when date changes

      try {
        const response = await fetch(`/api/bookings/blocked?providerId=${providerId}`);
        if (!response.ok) throw new Error('Failed to fetch blocked slots');
        
        const data = await response.json();
        const blockedSlots = data.blocked || [];

        if (!cancelled) {
          const slots = generateTimeSlots(selectedDate, blockedSlots);
          setAvailableTimes(slots);
        }
      } catch (error) {
        console.error('Error fetching blocked slots:', error);
        // Fall back to showing all slots on error
        if (!cancelled) {
          const slots = generateTimeSlots(selectedDate, []);
          setAvailableTimes(slots);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSlots(false);
        }
      }
    };

    fetchBlockedSlots();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, providerId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setSelectedTime('');
      setNotes('');
      setAvailableTimes([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    
    // Haptic feedback on submit
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error('You must be logged in.');
        return;
      }

      const token = await currentUser.getIdToken();
      const bookingTime = combineDateAndTime(selectedDate, selectedTime);

      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: service.id,
          providerId: service.providerId,
          bookingTime,
          notes
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || 'Booking failed.');
        return;
      }

      const data = await res.json();
      toast.success('Redirecting to payment...');
      window.location.href = data.checkoutUrl;
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900">Book {service.name}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:bg-gray-50 disabled:text-gray-400"
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time
            </label>
            <select
              required
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={!selectedDate || isLoadingSlots || isSubmitting}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {!selectedDate 
                  ? 'Select a date first' 
                  : isLoadingSlots 
                  ? 'Loading available times...' 
                  : availableTimes.length === 0
                  ? 'No available times'
                  : 'Choose a time'
                }
              </option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {formatTimeSlot(time)}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="Any special requests or information..."
            />
          </div>

          {/* Price Summary */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service Price</span>
              <span className="text-lg font-semibold text-gray-900">
                ${(service.price / 100).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedDate || !selectedTime || isLoadingSlots}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Continue to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}