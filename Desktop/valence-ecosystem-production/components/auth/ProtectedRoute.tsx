'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireEmailVerification = false,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push(redirectTo);
    }

    if (!loading && currentUser && requireEmailVerification && !currentUser.emailVerified) {
      router.push('/auth/verify-email');
    }
  }, [currentUser, loading, router, requireEmailVerification, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (requireEmailVerification && !currentUser.emailVerified) {
    return null;
  }

  return <>{children}</>;
}