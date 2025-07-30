import { notFound } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Calendar, Clock, MapPin, Star, Shield, Check } from 'lucide-react';
import Link from 'next/link';

// Mock data for demonstration
const mockService = {
  id: '1',
  name: 'Professional Yoga Instruction',
  description: 'Transform your mind and body with personalized yoga sessions. Whether you\'re a beginner or advanced practitioner, I\'ll create a custom program tailored to your goals and abilities.',
  longDescription: `
    With over 10 years of experience in various yoga styles including Hatha, Vinyasa, and Yin, 
    I provide personalized instruction that adapts to your unique needs and goals.
    
    What's included:
    • Initial assessment and goal setting
    • Customized yoga sequences
    • Breathing techniques and meditation
    • Lifestyle and nutrition guidance
    • Progress tracking and adjustments
  `,
  price: 75,
  duration: 60,
  rating: 4.9,
  reviews: 127,
  category: 'Wellness',
  location: 'Downtown Studio',
  provider: {
    id: '1',
    name: 'Sarah Johnson',
    image: '/api/placeholder/100/100',
    bio: 'Certified yoga instructor with 10+ years of experience',
    verified: true,
    responseTime: '< 1 hour',
    completedBookings: 450,
  },
  images: ['/api/placeholder/600/400'],
  availability: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    hours: '8:00 AM - 6:00 PM',
  },
  cancellationPolicy: 'Free cancellation up to 24 hours before the session',
};

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  // In a real app, fetch the service from Supabase
  const service = mockService;

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Header */}
            <div className="glass-panel p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{service.name}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      {service.location}
                    </div>
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {'★'.repeat(Math.floor(service.rating))}
                      </div>
                      <span className="text-gray-400 ml-1">
                        {service.rating} ({service.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#00FFAD]">${service.price}</div>
                  <div className="text-gray-400 text-sm">per session</div>
                </div>
              </div>

              {/* Service Image */}
              <div className="bg-gray-800 h-64 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-gray-500">Service Image</span>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <p className="text-gray-300">{service.description}</p>
                <div className="text-gray-300 whitespace-pre-line">{service.longDescription}</div>
              </div>
            </div>

            {/* Provider Info */}
            <div className="glass-panel p-6">
              <h2 className="text-xl font-semibold text-white mb-4">About the Provider</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-gray-400">Photo</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-medium text-white">{service.provider.name}</h3>
                    {service.provider.verified && (
                      <div className="flex items-center text-[#00FFAD] text-sm">
                        <Shield className="w-4 h-4 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 mb-3">{service.provider.bio}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      Responds in {service.provider.responseTime}
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Check className="w-4 h-4 mr-1" />
                      {service.provider.completedBookings} completed bookings
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="glass-panel p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Reviews</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-gray-800 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">Customer {i}</span>
                          <span className="text-sm text-gray-400">2 days ago</span>
                        </div>
                        <div className="flex text-yellow-400 text-sm mb-2">
                          {'★'.repeat(5)}
                        </div>
                        <p className="text-gray-300 text-sm">
                          Excellent service! Very professional and attentive to my needs.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Book This Service</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration
                  </div>
                  <span className="text-white">{service.duration} minutes</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    Availability
                  </div>
                  <span className="text-white text-sm text-right">
                    {service.availability.days.join(', ')}<br />
                    {service.availability.hours}
                  </span>
                </div>
                
                <div className="py-3">
                  <div className="text-sm text-gray-400 mb-1">Cancellation Policy</div>
                  <p className="text-white text-sm">{service.cancellationPolicy}</p>
                </div>
              </div>

              <Link
                href={`/booking/${service.id}`}
                className="block w-full bg-[#00FFAD] text-gray-900 text-center py-3 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all transform hover:scale-105 shadow-lg shadow-[#00FFAD]/20"
              >
                Book Now - ${service.price}
              </Link>
              
              <p className="text-center text-gray-400 text-sm mt-4">
                You won't be charged until after the service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}