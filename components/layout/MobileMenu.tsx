'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Search, Calendar, MessageSquare, User, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { isSignedIn, userId } = useAuth();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Search },
    ...(isSignedIn
      ? [
          { href: '/bookings', label: 'Bookings', icon: Calendar },
          { href: '/messages', label: 'Messages', icon: MessageSquare },
          { href: '/dashboard', label: 'Dashboard', icon: User },
          { href: '/dashboard/provider', label: 'Provider Hub', icon: Store },
        ]
      : []),
  ];

  const handleNavClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed right-0 top-0 h-full w-80 bg-[#0D0D0D] border-l border-white/10 z-50 md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Menu</h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </motion.button>
            </div>

            {/* User Section */}
            {isSignedIn ? (
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <UserButton afterSignOutUrl="/" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Welcome back!</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 border-b border-white/10">
                <Link
                  href="/auth/sign-in"
                  onClick={handleNavClick}
                  className="block w-full"
                >
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#00FFAD] text-gray-900 py-3 rounded-lg font-semibold hover:bg-[#00FF8C] transition-colors"
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={handleNavClick}
                  className="block w-full mt-3"
                >
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full glass-button-primary py-3 rounded-lg font-semibold"
                  >
                    Create Account
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="py-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                  >
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-4 px-6 py-3 transition-colors ${
                        isActive
                          ? 'bg-[#00FFAD]/10 text-[#00FFAD] border-r-2 border-[#00FFAD]'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
              <div className="flex gap-4 text-sm text-gray-400">
                <Link href="/help" onClick={handleNavClick} className="hover:text-[#00FFAD]">
                  Help
                </Link>
                <Link href="/terms" onClick={handleNavClick} className="hover:text-[#00FFAD]">
                  Terms
                </Link>
                <Link href="/privacy" onClick={handleNavClick} className="hover:text-[#00FFAD]">
                  Privacy
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}