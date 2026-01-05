interface StatusBadgeProps {
    status: string;
    type?: 'status' | 'priority'; // Reuse for both
  }
  
  export default function StatusBadge({ status, type = 'status' }: StatusBadgeProps) {
    
    const getColors = (val: string) => {
      const v = val.toLowerCase();
      
      // Priorities
      if (v === 'high') return 'bg-red-100 text-red-700 border-red-200';
      if (v === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      if (v === 'low') return 'bg-blue-100 text-blue-700 border-blue-200';
      
      // Statuses
      if (v === 'open') return 'bg-green-100 text-green-700 border-green-200';
      if (v === 'in-progress') return 'bg-purple-100 text-purple-700 border-purple-200';
      if (v === 'closed') return 'bg-gray-100 text-gray-500 border-gray-200 line-through';
      
      return 'bg-gray-100 text-gray-700'; // Default
    };
  
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getColors(status)} uppercase tracking-wide`}>
        {status}
      </span>
    );
  }