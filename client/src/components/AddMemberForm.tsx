import { useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  jobTitle?: string;
}

interface AddMemberFormProps {
  projectId: string;
  onMemberAdded: (updatedProject: any) => void;
}

export default function AddMemberForm({ projectId, onMemberAdded }: AddMemberFormProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Search effect: Runs when user stops typing for 300ms (Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/users/search?query=${query}`);
        setResults(res.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleAddUser = async (userId: string) => {
    try {
      const res = await api.put(`/projects/${projectId}/members`, { userId });
      onMemberAdded(res.data); // Update parent state
      setQuery(''); // Reset search
      setResults([]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  return (
    <div className="relative mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">Add Team Member</label>
      <input
        type="text"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Search by username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      
      {/* Search Results Dropdown */}
      {results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1 max-h-60 overflow-y-auto">
          {results.map(user => (
            <li 
              key={user._id}
              onClick={() => handleAddUser(user._id)}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-800">{user.username}</p>
                <p className="text-xs text-gray-500">{user.jobTitle || 'No Title'} • {user.email}</p>
              </div>
              <button className="text-blue-600 text-sm font-bold">Add +</button>
            </li>
          ))}
        </ul>
      )}

      {loading && <p className="text-xs text-gray-400 mt-1">Searching...</p>}
    </div>
  );
}