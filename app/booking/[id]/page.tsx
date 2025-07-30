'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Calendar, Clock, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useClerkAuth';

// Mock service data
const mockService = {
  id: '1',
  name: 'Professional Yoga Instruction',
  provider: 'Sarah Johnson',
  price: 75,
  duration: 60,
};

// Generate calendar days
function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
}

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(tomorrow);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = generateCalendarDays(currentMonth.getFullYear(), currentMonth.getMonth());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateDisabled = (date: Date | null) => {
    if (!date) return true;
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    return dateOnly < today;
  };

  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleBooking = async () => {
    if (!isSignedIn) {
      router.push('/auth/sign-in?redirect_url=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time');
      return;
    }

    setIsBooking(true);
    
    // Simulate booking API call
    setTimeout(() => {
      router.push('/bookings?success=true');
    }, 2000);
  };

  const calculatePlatformFee = (price: number) => {
    return (price * 0.07).toFixed(2);
  };

  const calculateTotal = (price: number) => {
    return (price * 1.07).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Book Service</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Service Info */}
            <div className="glass-panel p-6">
              <h2 className="text-xl font-semibold text-white mb-2">{mockService.name}</h2>
              <p className="text-gray-400">with {mockService.provider}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {mockService.duration} minutes
                </div>
                <div className="text-[#00FFAD] font-semibold">
                  ${mockService.price}
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Select Date</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousMonth}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <span className="text-white font-medium px-3" data-testid="current-month">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm text-gray-400 py-2">
                    {day}
                  </div>
                ))}
                {days.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => date && !isDateDisabled(date) && setSelectedDate(date)}
                    disabled={isDateDisabled(date)}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm
                      ${!date ? 'invisible' : ''}
                      ${isDateDisabled(date) ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-gray-800 cursor-pointer'}
                      ${isDateSelected(date) ? 'bg-[#00FFAD] text-gray-900 hover:bg-[#00FF8C]' : ''}
                      transition-colors
                    `}
                  >
                    {date?.getDate()}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Select Time</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`
                        py-3 px-4 rounded-lg font-medium transition-all
                        ${selectedTime === time 
                          ? 'bg-[#00FFAD] text-gray-900' 
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Additional Notes (Optional)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#00FFAD] focus:ring-1 focus:ring-[#00FFAD] transition-all resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Booking Summary */}
          <div className="md:col-span-1">
            <div className="glass-panel p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>
              
              {selectedDate && selectedTime ? (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Date</span>
                    <span className="text-white">
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Time</span>
                    <span className="text-white">{selectedTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white">{mockService.duration} minutes</span>
                  </div>
                  
                  <div className="border-t border-gray-800 pt-3 mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Service Price</span>
                      <span className="text-white">${mockService.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-400">Platform Fee (7%)</span>
                      <span className="text-white">${calculatePlatformFee(mockService.price)}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold mt-3 pt-3 border-t border-gray-800">
                      <span className="text-white">Total</span>
                      <span className="text-[#00FFAD]">${calculateTotal(mockService.price)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm mb-6">
                  Select a date and time to see booking details
                </p>
              )}

              <button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || isBooking}
                className={`
                  w-full py-3 rounded-lg font-semibold transition-all
                  ${selectedDate && selectedTime && !isBooking
                    ? 'bg-[#00FFAD] text-gray-900 hover:bg-[#00FF8C] transform hover:scale-105 shadow-lg shadow-[#00FFAD]/20'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isBooking ? 'Processing...' : 'Confirm Booking'}
              </button>
              
              <div className="mt-4 flex items-center justify-center text-sm text-gray-400">
                <CreditCard className="w-4 h-4 mr-2" />
                Secure payment powered by Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}