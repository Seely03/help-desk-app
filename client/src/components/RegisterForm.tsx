import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Call the backend API
      await registerUser(formData);
      
      // 2. On success, redirect to login page
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      // Handle Zod or Mongoose errors from backend
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleRegister} className="p-6 border rounded shadow-md max-w-sm mx-auto mt-10 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Username</label>
        <input 
          name="username"
          type="text" 
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="jdoe"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Must be lowercase letters only.</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input 
          name="email"
          type="email" 
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="user@amazon.com"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Password</label>
        <input 
          name="password"
          type="password" 
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 font-semibold transition-colors">
        Sign Up
      </button>

      <p className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </form>
  );
}