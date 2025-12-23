import { useState } from 'react';
import { loginUser } from '../services/authService';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      console.log('Login Successful:', data);
      alert('Logged in!');
      // TODO: Redirect to Dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-4 border rounded shadow-md max-w-sm mx-auto mt-10">
      <h2 className="text-xl mb-4">Login</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="user@amazon.com"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Password</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        Login
      </button>
    </form>
  );
}