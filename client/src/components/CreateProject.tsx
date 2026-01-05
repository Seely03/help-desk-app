import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from './Layout';

export default function CreateProject() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Send data to backend
      await api.post('/projects', {
        name,
        description
      });
      
      // 2. Redirect to Dashboard on success
      navigate('/dashboard'); 
    } catch (err: any) {
      console.error(err);
      // Zod validation errors usually come in err.response.data.errors
      const msg = err.response?.data?.message || 'Failed to create project';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Project</h1>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Website Redesign"
                required
                maxLength={100}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the project goals..."
                maxLength={4000}
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-1/3 bg-gray-200 text-gray-800 p-2 rounded hover:bg-gray-300 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="w-2/3 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-semibold disabled:bg-blue-400"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}