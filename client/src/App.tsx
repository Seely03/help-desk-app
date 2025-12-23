import { useState, useEffect } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import LoginForm from './components/LoginForm'; // <--- Import Login
import type { Ticket } from './types';
import { AuthProvider, useAuth } from './context/AuthContext'; // <--- Import Context

// Create a child component to handle the Logic (since App is the Provider)
function Dashboard() {
  const { user, logout } = useAuth(); // <--- Access User
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    // Only fetch if logged in
    if (user) fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tickets');
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleTicketCreated = (newTicket: Ticket) => {
    setTickets([newTicket, ...tickets]);
  };

  // If not logged in, show Login Screen
  if (!user) {
    return <LoginForm />;
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
      <Dashboard />
    </AuthProvider>
  );
}

export default App;