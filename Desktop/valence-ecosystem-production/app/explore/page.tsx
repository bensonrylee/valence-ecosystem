'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, MapPin, X } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ServiceDocument, CategoryDocument } from '@/lib/firebase-collections';
import CategoryFilter from '@/components/explore/CategoryFilter';
import ServiceCard from '@/components/explore/ServiceCard';
import ServiceCardSkeleton from '@/components/explore/ServiceCardSkeleton';
// Removed mock data import - not needed for production
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

const SERVICES_PER_PAGE = 12;

export default function ExplorePage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [categories, setCategories] = useState<CategoryDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('active', '==', true),
          orderBy('order')
        );
        const snapshot = await getDocs(categoriesQuery);
        const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryDocument));
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Set default categories if fetch fails
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Load services
  const loadServices = useCallback(async (reset: boolean = false) => {
    if (!reset && (!hasMore || isLoadingMore)) return;

    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      // Use Firestore to fetch services
      let servicesQuery = query(
        collection(db, 'services'),
        where('active', '==', true)
      );
      
      if (selectedCategory) {
        servicesQuery = query(servicesQuery, where('category', '==', selectedCategory));
      }
      
      if (debouncedSearchQuery) {
        // Note: Full-text search requires additional setup (Algolia, etc.)
        servicesQuery = query(servicesQuery, where('tags', 'array-contains', debouncedSearchQuery.toLowerCase()));
      }
      
      servicesQuery = query(servicesQuery, orderBy('featured', 'desc'), orderBy('rating', 'desc'), limit(SERVICES_PER_PAGE));
      
      if (!reset && lastDoc) {
        servicesQuery = query(servicesQuery, startAfter(lastDoc));
      }
      
      const snapshot = await getDocs(servicesQuery);
      const fetchedServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceDocument));
      
      if (reset) {
        setServices(fetchedServices);
      } else {
        setServices(prev => [...prev, ...fetchedServices]);
      }
      
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === SERVICES_PER_PAGE);
      
      // const snapshot = await getDocs(servicesQuery);
      // const newServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceDocument));
      
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, debouncedSearchQuery, hasMore, isLoadingMore, lastDoc]);

  // Initial load and reload on filters change
  useEffect(() => {
    loadServices(true);
  }, [selectedCategory, debouncedSearchQuery]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        loadServices(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadServices]);

  const handleBook = (service: ServiceDocument) => {
    // Navigate to service detail page
    router.push(`/services/${service.id || service.providerId}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              <Filter className="w-5 h-5 text-gray-700" />
            </button>

            {/* Location Button */}
            <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              <MapPin className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Count */}
        {!isLoading && (
          <div className="mb-4 text-sm text-gray-600">
            {services.length === 0 
              ? 'No services found' 
              : `${services.length}+ services available`}
            {selectedCategory && (
              <span className="ml-2">
                in <span className="font-medium">{categories.find(c => c.slug === selectedCategory)?.name}</span>
              </span>
            )}
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            // Initial loading skeletons
            Array.from({ length: 8 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))
          ) : (
            <>
              {services.map((service) => (
                <ServiceCard
                  key={service.id || service.providerId}
                  service={service}
                  onBook={handleBook}
                  currentLocation={currentLocation || undefined}
                />
              ))}
              
              {/* Loading more skeletons */}
              {isLoadingMore && (
                Array.from({ length: 4 }).map((_, i) => (
                  <ServiceCardSkeleton key={`loading-${i}`} />
                ))
              )}
            </>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && services.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters to find what you're looking for
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* End of Results */}
        {!isLoading && !hasMore && services.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            You've reached the end of the results
          </div>
        )}
      </div>
    </div>
  );
}