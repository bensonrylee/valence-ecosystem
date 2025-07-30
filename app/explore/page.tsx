'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { servicesService } from '@/lib/supabase/services';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';

// Mock data for demonstration
const mockServices = [
  {
    id: '1',
    name: 'Professional Yoga Instruction',
    description: 'Personal yoga sessions tailored to your needs and skill level.',
    price: 75,
    rating: 4.9,
    reviews: 127,
    category: 'Wellness',
    location: 'Downtown',
    image: '/api/placeholder/300/200'
  },
  {
    id: '2',
    name: 'Business Consulting',
    description: 'Strategic business advice and planning for growing companies.',
    price: 150,
    rating: 4.8,
    reviews: 89,
    category: 'Business',
    location: 'Financial District',
    image: '/api/placeholder/300/200'
  },
  {
    id: '3',
    name: 'Personal Training',
    description: 'One-on-one fitness coaching with certified trainers.',
    price: 80,
    rating: 4.7,
    reviews: 156,
    category: 'Fitness',
    location: 'Midtown',
    image: '/api/placeholder/300/200'
  }
];

const categories = [
  'All',
  'Wellness',
  'Business',
  'Fitness',
  'Education',
  'Technology',
  'Creative'
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [services, setServices] = useState(mockServices);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic would go here
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Explore Services</h1>
            <button 
              className="md:hidden flex items-center px-4 py-2 border border-[#00FFAD]/30 rounded-lg text-gray-300 hover:text-[#00FFAD] hover:border-[#00FFAD]/50 transition-all"
              data-testid="mobile-filter-button"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 space-y-6">
            {/* Search */}
            <div>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services..."
                    className="glass-input w-full pl-10"
                    data-testid="search-input"
                  />
                </div>
              </form>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-[#00FFAD] text-gray-900'
                        : 'text-gray-300 hover:text-[#00FFAD] hover:bg-gray-800'
                    }`}
                    data-testid={`category-${category.toLowerCase()}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                {isLoading ? 'Loading...' : `${filteredServices.length} services found`}
              </p>
              <button className="hidden md:flex items-center px-4 py-2 border border-[#00FFAD]/30 rounded-lg text-gray-300 hover:text-[#00FFAD] hover:border-[#00FFAD]/50 transition-all">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>

            {/* Services Grid */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-panel p-6 animate-pulse" data-testid="service-skeleton">
                    <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
                    <div className="bg-gray-700 h-4 rounded mb-2"></div>
                    <div className="bg-gray-700 h-3 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="bg-gray-700 h-3 w-20 rounded"></div>
                      <div className="bg-gray-700 h-3 w-16 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <Link key={service.id} href={`/services/${service.id}`} className="block glass-panel p-6 hover:bg-white/10 hover:border-[#00FFAD]/20 transition-all cursor-pointer" data-testid="service-card">
                    <div className="bg-gray-700 h-48 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-gray-400">Image</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">{service.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(Math.floor(service.rating))}
                        </div>
                        <span className="text-gray-400 text-sm ml-1">
                          {service.rating} ({service.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {service.location}
                      </div>
                      <div className="text-[#00FFAD] font-semibold">
                        ${service.price}/hr
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12" data-testid="no-results">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No services found</h3>
                <p className="text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}