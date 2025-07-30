'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useAuth } from '@/hooks/useClerkAuth';
import { Search, Calendar, MessageSquare, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/theme-constants';

export function Navigation() {
  const pathname = usePathname();
  const { user, isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Explore', href: '/explore', icon: Search },
    { name: 'Bookings', href: '/bookings', icon: Calendar, requireAuth: true },
    { name: 'Messages', href: '/messages', icon: MessageSquare, requireAuth: true },
    { name: 'Profile', href: '/profile', icon: User, requireAuth: true },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">
              <span className="text-[#00FFAD]">Eco</span>
              <span className="text-white">system</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              if (item.requireAuth && !isSignedIn) return null;
              
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                    isActive(item.href)
                      ? 'bg-[#00FFAD]/10 text-[#00FFAD]'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-[#00FFAD]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                {user?.role === 'provider' && (
                  <Link
                    href="/dashboard"
                    className="hidden md:inline-flex items-center px-4 py-2 bg-[#00FFAD] text-gray-900 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all"
                  >
                    Provider Dashboard
                  </Link>
                )}
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/auth/sign-in"
                  className="text-gray-300 hover:text-[#00FFAD] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="px-4 py-2 bg-[#00FFAD] text-gray-900 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
              aria-label="menu"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navigation.map((item) => {
              if (item.requireAuth && !isSignedIn) return null;
              
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg transition-all',
                    isActive(item.href)
                      ? 'bg-[#00FFAD]/10 text-[#00FFAD]'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-[#00FFAD]'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {!isSignedIn && (
              <div className="pt-4 space-y-2 border-t border-gray-800">
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-center text-gray-300 hover:text-[#00FFAD] transition-colors"
                  data-testid="sign-in-link"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-center bg-[#00FFAD] text-gray-900 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {isSignedIn && user?.role === 'provider' && (
              <div className="pt-4 border-t border-gray-800">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-center bg-[#00FFAD] text-gray-900 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all"
                >
                  Provider Dashboard
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}