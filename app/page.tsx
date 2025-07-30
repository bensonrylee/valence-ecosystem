import Link from 'next/link';
import { Search, Star, Shield, Clock } from 'lucide-react';
import { auth } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

export default async function HomePage() {
  const { userId } = auth();
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-white">
                <span className="text-[#00FFAD]">Eco</span>system
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/explore" className="text-gray-300 hover:text-[#00FFAD] transition-colors">
                Explore
              </Link>
              <Link href="/how-it-works" className="text-gray-300 hover:text-[#00FFAD] transition-colors">
                How it Works
              </Link>
              {userId ? (
                <>
                  <Link href="/dashboard" className="text-gray-300 hover:text-[#00FFAD] transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/messages" className="text-gray-300 hover:text-[#00FFAD] transition-colors">
                    Messages
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </>
              ) : (
                <>
                  <Link href="/auth/sign-in" className="text-gray-300 hover:text-[#00FFAD] transition-colors" data-testid="sign-in-link">
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/sign-up" 
                    className="bg-[#00FFAD] text-gray-900 px-4 py-2 rounded-lg hover:bg-[#00FF8C] transition-colors font-semibold"
                    data-testid="sign-up-button"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-gray-300 hover:text-white"
              aria-label="Open menu"
              data-testid="mobile-menu-button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" data-testid="hero-title">
            Find & Book Premium Services
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover trusted professionals in your area. From wellness to consulting, 
            book premium services with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/explore" 
              className="bg-[#00FFAD] text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all transform hover:scale-105 inline-flex items-center justify-center shadow-lg shadow-[#00FFAD]/20"
              data-testid="explore-services-button"
            >
              <Search className="w-5 h-5 mr-2" />
              Explore Services
            </Link>
            <Link 
              href="/auth/sign-up" 
              className="border border-[#00FFAD] text-[#00FFAD] px-8 py-4 rounded-lg font-semibold hover:bg-[#00FFAD]/10 transition-colors"
              data-testid="become-provider-button"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Ecosystem?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-gray-800/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-[#00FFAD] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Premium Quality</h3>
              <p className="text-gray-300">
                All service providers are vetted and verified for quality assurance.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-gray-800/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-[#00FFAD]/80 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure Payments</h3>
              <p className="text-gray-300">
                Your payments are protected with enterprise-grade security.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-gray-800/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-[#00FFAD]/60 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant Booking</h3>
              <p className="text-gray-300">
                Book services instantly with real-time availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied customers who trust Ecosystem for their service needs.
          </p>
          <Link 
            href="/auth/sign-up" 
            className="bg-[#00FFAD] text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all transform hover:scale-105 inline-block shadow-lg shadow-[#00FFAD]/20"
            data-testid="cta-signup-button"
          >
            Start Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 Ecosystem. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}