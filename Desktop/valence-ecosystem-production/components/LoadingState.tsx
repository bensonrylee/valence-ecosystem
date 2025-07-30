'use client';

import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingState({ message = 'Loading...', fullScreen = true }: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="relative w-16 h-16 mb-4"
      >
        <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full"></div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400"
      >
        {message}
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

// Skeleton loaders for specific components
export function ServiceCardSkeleton() {
  return (
    <div className="glass-panel p-6 animate-pulse">
      <div className="h-40 bg-glass-light rounded-lg mb-4"></div>
      <div className="h-6 bg-glass-light rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-glass-light rounded w-full mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-glass-light rounded w-20"></div>
        <div className="h-8 bg-glass-light rounded w-24"></div>
      </div>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="glass-panel p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-glass-light rounded-lg"></div>
        <div className="h-4 bg-glass-light rounded w-16"></div>
      </div>
      <div className="h-8 bg-glass-light rounded w-32 mb-2"></div>
      <div className="h-4 bg-glass-light rounded w-24"></div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-glass-light rounded w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-glass-light rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-glass-light rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-glass-light rounded w-16"></div>
      </td>
    </tr>
  );
}