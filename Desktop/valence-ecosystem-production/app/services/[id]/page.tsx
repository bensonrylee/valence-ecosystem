'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ServiceDocument, ReviewDocument } from '@/lib/firebase-collections';
import { 
  Star, 
  Clock, 
  MapPin, 
  Shield, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  MessageCircle,
  CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import BookingModal from '@/components/booking/BookingModal';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Skeleton components for loading states
function ServiceDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Image gallery skeleton */}
      <div className="relative h-[60vh] md:h-[70vh] bg-gray-200" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
            </div>
            
            <div className="h-40 bg-gray-200 rounded-xl" />
            <div className="h-60 bg-gray-200 rounded-xl" />
          </div>
          
          {/* Sidebar skeleton */}
          <div className="space-y-6">
            <div className="h-60 bg-gray-200 rounded-xl" />
            <div className="h-20 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  
  const [service, setService] = useState<ServiceDocument | null>(null);
  const [reviews, setReviews] = useState<ReviewDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Check auth status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      try {
        // For now, use mock data if no Firestore connection
        const mockService: ServiceDocument = {
          id: serviceId,
          name: 'Professional Deep Cleaning Service',
          description: `Transform your home with our comprehensive deep cleaning service. Our experienced professionals use eco-friendly products and state-of-the-art equipment to ensure every corner of your space sparkles.

What's included:
• Deep cleaning of all rooms
• Kitchen appliances and cabinets
• Bathroom sanitization
• Window and mirror cleaning
• Floor mopping and vacuuming
• Dusting all surfaces

Our team is fully insured, background-checked, and committed to exceeding your expectations. We bring all necessary supplies and equipment.`,
          price: 15000, // $150
          currency: 'USD',
          duration: 180, // 3 hours
          
          providerId: 'provider_123',
          providerName: 'Sarah\'s Cleaning Co.',
          providerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          
          category: 'home-services',
          subcategory: 'cleaning',
          tags: ['deep cleaning', 'eco-friendly', 'insured', 'professional'],
          
          images: [
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
            'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=1200',
          ],
          coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200',
          
          location: { lat: 37.7749, lng: -122.4194 },
          serviceArea: ['94102', '94103', '94104'],
          remote: false,
          
          rating: 4.8,
          reviewCount: 127,
          completedBookings: 342,
          responseTime: 2,
          
          availability: {
            monday: { start: '08:00', end: '18:00', enabled: true },
            tuesday: { start: '08:00', end: '18:00', enabled: true },
            wednesday: { start: '08:00', end: '18:00', enabled: true },
            thursday: { start: '08:00', end: '18:00', enabled: true },
            friday: { start: '08:00', end: '18:00', enabled: true },
            saturday: { start: '09:00', end: '16:00', enabled: true },
            sunday: { start: '10:00', end: '16:00', enabled: false },
          },
          
          active: true,
          featured: true,
          verified: true,
          
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        setService(mockService);
        
        // In production, fetch from Firestore:
        // const serviceDoc = await getDoc(doc(db, 'services', serviceId));
        // if (serviceDoc.exists()) {
        //   setService({ id: serviceDoc.id, ...serviceDoc.data() } as ServiceDocument);
        // } else {
        //   router.push('/404');
        // }
        
        // Fetch reviews
        const mockReviews: ReviewDocument[] = [
          {
            id: '1',
            bookingId: 'booking_1',
            serviceId: serviceId,
            serviceName: 'Deep Cleaning',
            providerId: 'provider_123',
            providerName: 'Sarah\'s Cleaning Co.',
            buyerId: 'user_1',
            buyerName: 'Emily Johnson',
            buyerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
            rating: 5,
            comment: 'Absolutely fantastic service! Sarah and her team were professional, thorough, and left my home spotless. Highly recommend!',
            verified: true,
            helpful: ['user_2', 'user_3'],
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
          },
          {
            id: '2',
            bookingId: 'booking_2',
            serviceId: serviceId,
            serviceName: 'Deep Cleaning',
            providerId: 'provider_123',
            providerName: 'Sarah\'s Cleaning Co.',
            buyerId: 'user_2',
            buyerName: 'Michael Chen',
            buyerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
            rating: 5,
            comment: 'Excellent attention to detail. They cleaned areas I didn\'t even think about. Will definitely book again!',
            verified: true,
            helpful: ['user_1'],
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-10'),
          },
        ];
        
        setReviews(mockReviews);
        
      } catch (error) {
        console.error('Error fetching service:', error);
        toast.error('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId, router]);

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!service) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => 
        prev === 0 ? service.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === service.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleBook = () => {
    if (!currentUserId) {
      toast.error('Please sign in to book services');
      router.push('/login');
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service?.name,
          text: `Check out ${service?.name} on Ecosystem`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  if (loading) {
    return <ServiceDetailSkeleton />;
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Service not found</h2>
          <button
            onClick={() => router.push('/explore')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-[60vh] md:h-[70vh] bg-gray-100 overflow-hidden">
        <Image
          src={service.images[currentImageIndex]}
          alt={service.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFavorite}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Image navigation */}
        {service.images.length > 1 && (
          <>
            <button
              onClick={() => handleImageNavigation('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleImageNavigation('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Image indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {service.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex 
                      ? 'bg-white w-8' 
                      : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and tags */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{service.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{service.rating}</span>
                  <span>({service.reviewCount} reviews)</span>
                </div>
                <span>•</span>
                <span>{service.completedBookings} bookings</span>
                {service.verified && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Shield className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this service</h2>
              <div className="text-gray-600 whitespace-pre-line">{service.description}</div>
            </div>

            {/* Provider Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Meet your provider</h2>
              <div className="flex items-start gap-4">
                <Image
                  src={service.providerAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Provider'}
                  alt={service.providerName}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{service.providerName}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Responds in ~{service.responseTime}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Available {Object.values(service.availability).filter(d => d.enabled).length} days/week</span>
                    </div>
                  </div>
                  <button className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message provider</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <>
                {/* Review Summary */}
                <ReviewSummary
                  rating={service.rating}
                  totalReviews={service.reviewCount}
                  categories={{
                    quality: 4.7,
                    communication: 4.8,
                    punctuality: 4.9,
                    value: 4.6,
                  }}
                />
                
                {/* Recent Reviews */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
                    {service.reviewCount > 2 && (
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        See all {service.reviewCount} reviews
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {reviews.slice(0, 2).map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        currentUserId={currentUserId || undefined}
                        showProviderResponse={true}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-4 space-y-6 h-fit">
            {/* Booking Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ${(service.price / 100).toFixed(0)}
                  </span>
                  <span className="text-gray-600">/ session</span>
                </div>
                <p className="text-sm text-gray-600">
                  {service.duration} minute session
                </p>
              </div>
              
              <button
                onClick={handleBook}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Book Now
              </button>
              
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Free cancellation up to 24h before</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>100% money-back guarantee</span>
                </div>
              </div>
            </div>

            {/* Location */}
            {!service.remote && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Service area</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Available in: {service.serviceArea?.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${(service.price / 100).toFixed(0)}
            </span>
            <span className="text-gray-600 ml-1">/ session</span>
          </div>
          <button
            onClick={toggleFavorite}
            className="p-2"
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>
        <button
          onClick={handleBook}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md font-medium"
        >
          Book Now
        </button>
      </div>

      {/* Booking Modal */}
      {service && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          service={{
            id: service.id || serviceId,
            name: service.name,
            price: service.price,
            providerId: service.providerId,
            providerName: service.providerName,
          }}
          providerId={service.providerId}
        />
      )}
    </div>
  );
}