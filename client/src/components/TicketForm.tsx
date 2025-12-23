import { useState } from 'react';
import type { Ticket } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
  onTicketCreated: (ticket: Ticket) => void; // Callback to update the list immediately
}

export default function TicketForm({ onTicketCreated }: Props) {
  const { user } = useAuth(); // <--- Access User
  // Local state for form fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Low',
    sizing: 1,
    userEmail: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('You must be logged in');
    try {
        const response = await fetch('http://localhost:5000/api/tickets', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                 title: formData.title,
                 description: formData.description,
                 priority: formData.priority,
                 sizing: formData.sizing
            })
          });

      if (!response.ok) throw new Error('Failed to create ticket');

      const newTicket = await response.json();
      onTicketCreated(newTicket); // Notify parent component
      alert('Ticket Created Successfully!');
      
      // Reset form
      setFormData({ ...formData, title: '', description: '' }); 
    } catch (error) {
      alert('Error creating ticket');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
      <h3>Create New Ticket</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <input 
          type="email" 
          placeholder="Your Email"
          value={formData.userEmail}
          onChange={e => setFormData({...formData, userEmail: e.target.value})}
          required 
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <input 
          type="text" 
          placeholder="Issue Title"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          required 
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <textarea 
          placeholder="Description"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <select 
          value={formData.priority}
          onChange={e => setFormData({...formData, priority: e.target.value})}
          style={{ padding: '8px' }}
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>

        <select 
          value={formData.sizing}
          onChange={e => setFormData({...formData, sizing: Number(e.target.value)})}
          style={{ padding: '8px' }}
        >
          <option value={1}>1 Point</option>
          <option value={2}>2 Points</option>
          <option value={3}>3 Points</option>
          <option value={5}>5 Points</option>
          <option value={8}>8 Points</option>
        </select>
      </div>

      <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
        Submit Ticket
      </button>
    </form>
  );
}