export default function SkeletonLoader() {
    return (
      <div className="w-full animate-pulse space-y-6">
        
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
  
        {/* Grid Skeleton (Simulating your Project/Ticket Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          
          {/* Card 1 */}
          <div className="h-40 bg-gray-200 rounded-xl"></div>
          
          {/* Card 2 */}
          <div className="h-40 bg-gray-200 rounded-xl"></div>
          
          {/* Card 3 */}
          <div className="h-40 bg-gray-200 rounded-xl"></div>
  
        </div>
      </div>
    );
  }