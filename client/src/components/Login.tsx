import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between Login/Register
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Choose endpoint based on mode
    const endpoint = isRegistering ? '/api/users/register' : '/api/users/login'; // (We need to build the login route next!)
    // FOR NOW: Let's just use the Register endpoint you know works to test
    const url = `http://localhost:5000${endpoint}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegistering ? { name, email, password } : { email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);

      // Save user to Context (this automatically updates the App UI)
      login(data.token, data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <div style={{ marginBottom: '10px' }}>
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%' }} />
          </div>
        )}
        <div style={{ marginBottom: '10px' }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white' }}>
          {isRegistering ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)} style={{ marginTop: '10px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
}