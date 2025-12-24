import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <--- Import useNavigate
import { loginUser } from '../services/authService';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); // <--- Initialize the hook

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      console.log('Login Successful:', data);
      
      // Force a redirect to the dashboard
      navigate('/dashboard'); // <--- This line changes the page
      
    } catch (err: any) {
      // If login fails, stay here and show error
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-4 border rounded shadow-md max-w-sm mx-auto mt-10 bg-white">
      <h2 className="text-xl mb-4 font-bold">Login</h2>
      {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
      
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Email</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="test@amazon.com"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Password</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
        Login
      </button>

      <p className="mt-4 text-center text-sm">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}