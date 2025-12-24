import { useState, useEffect } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import LoginForm from './components/LoginForm'; // <--- Import Login
import type { Ticket } from './types';
import { AuthProvider, useAuth } from './context/AuthContext'; // <--- Import Context
import RegisterForm from './components/RegisterForm';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';

// Create a child component to handle the Logic (since App is the Provider)
function Dashboard() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      // USE api (axios) instead of fetch so the Token is sent!
      const res = await api.get('/tickets'); 
      setTickets(res.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleTicketCreated = (newTicket: Ticket) => {
    setTickets([newTicket, ...tickets]);
  };

  // If not logged in, show Login Screen
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If logged in, show Dashboard
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>IT Help Desk</h1>
        <div>
          <span>Welcome, {user.name} </span>
          <button onClick={logout} style={{ marginLeft: '10px', padding: '5px 10px' }}>Logout</button>
        </div>
      </div>
      
      <TicketForm onTicketCreated={handleTicketCreated} />
      <TicketList tickets={tickets} />
    </div>
  );
}

// Wrap the whole app in the Provider
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;