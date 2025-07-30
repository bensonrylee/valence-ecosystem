'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, Clock, MapPin, Shield, Heart } from 'lucide-react';
import { ServiceDocument } from '@/lib/firebase-collections';
import { formatDistanceToNow } from 'date-fns';

interface ServiceCardProps {
  service: ServiceDocument;
  onBook: (service: ServiceDocument) => void;
  currentLocation?: { lat: number; lng: number };
}

export default function ServiceCard({ service, onBook, currentLocation }: ServiceCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Calculate distance if location available
  const calculateDistance = () => {
    if (!currentLocation || !service.location) return null;
    
    const R = 3959; // Earth radius in miles
    const dLat = (service.location.lat - currentLocation.lat) * Math.PI / 180;
    const dLon = (service.location.lng - currentLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(currentLocation.lat * Math.PI / 180) * Math.cos(service.location.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${Math.round(distance * 10) / 10} mi` : `${Math.round(distance)} mi`;
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div 
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => onBook(service)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {!imageError ? (
          <Image
            src={service.coverImage}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl opacity-50">{service.category === 'home-services' ? '🏠' : '💼'}</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top Actions */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Featured Badge */}
          {service.featured && (
            <span className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              ⭐ Featured
            </span>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className="ml-auto bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all"
            aria-label="Add to favorites"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`} 
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title & Verification */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
              {service.name}
            </h3>
            {service.verified && (
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
          </div>
          
          {/* Provider Info */}
          <p className="text-sm text-gray-600 mt-1">
            by {service.providerName}
          </p>
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-900">{service.rating.toFixed(1)}</span>
            <span className="text-gray-500">({service.reviewCount})</span>
          </div>
          
          {/* Response Time */}
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">Responds in {service.responseTime}h</span>
          </div>
        </div>

        {/* Location & Duration */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {service.remote ? 'Remote' : calculateDistance() || 'Local'}
            </span>
          </div>
          <span>{service.duration} min</span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${(service.price / 100).toFixed(0)}
            </span>
            <span className="text-sm text-gray-500 ml-1">/ session</span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook(service);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}