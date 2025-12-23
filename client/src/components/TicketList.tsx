import type { Ticket } from '../types';

interface Props {
  tickets: Ticket[];
}

export default function TicketList({ tickets }: Props) {
  return (
    <div>
      <h3>Current Tickets ({tickets.length})</h3>
      {tickets.map(ticket => (
        <div key={ticket._id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{ticket.title}</strong>
            <span style={{ 
              backgroundColor: ticket.priority === 'High' ? '#ffcccc' : '#e0e0e0',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.8em'
            }}>
              {ticket.priority}
            </span>
          </div>
          <p style={{ margin: '5px 0', color: '#555' }}>{ticket.description}</p>
          <div style={{ fontSize: '0.8em', color: '#888' }}>
            Status: {ticket.status} | Size: {ticket.sizing} | User: {ticket.userEmail}
          </div>
        </div>
      ))}
    </div>
  );
}