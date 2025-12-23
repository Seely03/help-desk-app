export interface Ticket {
    _id: string;
    title: string;
    description: string;
    status: 'Open' | 'In Progress' | 'In Review' | 'Closed';
    priority: 'Low' | 'Medium' | 'High';
    sizing: number;
    userEmail: string;
    createdAt: string;
  }