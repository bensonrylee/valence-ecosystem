import { ServiceCardSkeleton } from '@/components/LoadingState';

export default function Loading() {
  return (
    <div className="min-h-screen bg-dark p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel p-6 mb-6">
          <div className="h-8 bg-glass-light rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-glass-light rounded w-64 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}