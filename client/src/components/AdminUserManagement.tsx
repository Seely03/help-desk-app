import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUser, createNewUser, deleteUser } from '../services/authService';
import Layout from './Layout';

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null); // If null, we are creating. If set, we are editing.
  
  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    jobTitle: '',
    isAdmin: false,
    password: '' // Only used for creating
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      // If unauthorized, kick them out
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', jobTitle: 'Software Engineer', isAdmin: false, password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({ 
      username: user.username || '', 
      email: user.email || '', 
      jobTitle: user.jobTitle || '', 
      isAdmin: user.isAdmin ?? false, // Use ?? for booleans
      password: '' // Keep password empty (we only send it if changing it)
    });
    setIsModalOpen(true);
  };

  const toggleUserStatus = async (user: any) => {
    // If true, make false. If false, make true.
    const newStatus = !user.isActive; 
    
    try {
      // We use the existing update function
      await updateUser(user._id, { isActive: newStatus });
      // Refresh list to show change
      fetchUsers(); 
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // 2. Handle Hard Delete
  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure? This will permanently remove the user.")) {
      try {
        await deleteUser(userId);
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete');
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // UPDATE MODE
        await updateUser(editingUser._id, formData);
        alert('User updated!');
      } else {
        // CREATE MODE
        await createNewUser(formData);
        alert('User created!');
      }
      setIsModalOpen(false);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <Layout user={user}>
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:underline">
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">All Users</h2>
          <button 
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Create User
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
          <tr className="border-b bg-gray-100">
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{user.username} <div className="text-xs text-gray-500">{user.email}</div></td>
                <td className="p-3">{user.jobTitle || '-'}</td>
                <td className="p-3">
                  {user.isAdmin ? (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">ADMIN</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">USER</span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleUserStatus(user)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      user.isActive 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Deactivated'}
                  </button>
                </td>
                <td className="p-3">
                  <button 
                    onClick={() => openEditModal(user)}
                    className="text-blue-600 hover:underline text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:underline text-sm font-semibold"
                  >🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Username</label>
                <input 
                  className="w-full border p-2 rounded" 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  className="w-full border p-2 rounded" 
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <select 
                  className="w-full border p-2 rounded"
                  value={formData.jobTitle}
                  onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Designer">Designer</option>
                  <option value="Tester">Tester</option>
                  <option value="Support Engineer">Support Engineer</option>
                </select>
              </div>

              {!editingUser && (
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input 
                    className="w-full border p-2 rounded" 
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              )}

              <div className="mb-6 flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onChange={e => setFormData({...formData, isAdmin: e.target.checked})}
                />
                <label htmlFor="isAdmin" className="text-sm font-bold text-gray-700">Is Admin?</label>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}