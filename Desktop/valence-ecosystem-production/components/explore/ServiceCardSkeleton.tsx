export default function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[4/3] bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
          <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded-lg w-20" />
          <div className="h-4 bg-gray-200 rounded-lg w-24" />
        </div>

        {/* Location */}
        <div className="h-4 bg-gray-200 rounded-lg w-1/3" />

        {/* Price & Button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="h-7 bg-gray-200 rounded-lg w-20" />
          <div className="h-9 bg-gray-200 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}