// Firebase Collection Schemas and Types

export interface ServiceDocument {
  // Basic Info
  id?: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  duration: number; // in minutes
  
  // Provider Info
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  
  // Category
  category: string;
  subcategory?: string;
  tags: string[];
  
  // Media
  images: string[];
  coverImage: string;
  
  // Location
  location?: {
    lat: number;
    lng: number;
  };
  serviceArea?: string[]; // array of zip codes or city names
  remote: boolean;
  
  // Stats
  rating: number;
  reviewCount: number;
  completedBookings: number;
  responseTime: number; // in hours
  
  // Availability
  availability: {
    monday: { start: string; end: string; enabled: boolean };
    tuesday: { start: string; end: string; enabled: boolean };
    wednesday: { start: string; end: string; enabled: boolean };
    thursday: { start: string; end: string; enabled: boolean };
    friday: { start: string; end: string; enabled: boolean };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
  };
  
  // Status
  active: boolean;
  featured: boolean;
  verified: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryDocument {
  id?: string;
  name: string;
  slug: string;
  icon: string; // emoji or icon name
  order: number;
  color: string; // hex color for UI
  subcategories: Array<{
    name: string;
    slug: string;
  }>;
  active: boolean;
  createdAt: Date;
}

export interface ReviewDocument {
  id?: string;
  bookingId: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  
  rating: number; // 1-5
  comment: string;
  photos?: string[];
  
  helpful: string[]; // user IDs who found this helpful
  verified: boolean; // completed booking
  
  providerResponse?: {
    text: string;
    respondedAt: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingDocument {
  id?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  
  sellerId: string;
  sellerName: string;
  
  participants: string[]; // [buyerId, sellerId] for efficient queries
  
  bookingTime: Date;
  duration: number; // minutes
  
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  
  amount: number; // total in cents
  platformFee: number; // 7% in cents
  providerPayout: number; // amount - fee
  
  paymentIntentId?: string;
  checkoutSessionId?: string;
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

// Search/Filter Types
export interface ServiceFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxDistance?: number; // in miles
  availability?: 'today' | 'this_week' | 'anytime';
  verified?: boolean;
  searchQuery?: string;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'distance' | 'popular';
}

// Provider Dashboard Types
export interface ProviderStats {
  totalEarnings: number;
  pendingEarnings: number;
  completedBookings: number;
  upcomingBookings: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  responseTime: number; // hours
}

export interface EarningsData {
  date: Date;
  amount: number;
  bookingCount: number;
}