import { useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

interface User {
    _id: string;
    username: string;
}

interface TicketProps {
    ticket: any;
    projectMembers: User[]; // We need the list of members to populate the "Assign" dropdown
}

export default function TicketItem({ ticket, projectMembers }: TicketProps) {
    const [status, setStatus] = useState(ticket.status);
    const [assignedTo, setAssignedTo] = useState(ticket.assignedTo?._id || '');

    // Handle Status Change (e.g. Open -> Closed)
    const handleStatusChange = async (newStatus: string) => {
        setStatus(newStatus); // Optimistic update (update UI instantly)
        try {
            await api.put(`/tickets/${ticket._id}`, { status: newStatus });
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert if failed
            setStatus(ticket.status);
        }
    };

    // Handle Assignment Change
    const handleAssignChange = async (userId: string) => {
        setAssignedTo(userId);
        try {
            await api.put(`/tickets/${ticket._id}`, { assignedTo: userId });
        } catch (err) {
            console.error("Failed to assign user", err);
        }
    };

    return (
        <div className="border p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 gap-4 bg-white shadow-sm mb-3 transition-all">

            {/* Left Side: Title & Description */}
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <Link to={`/tickets/${ticket._id}`} className="hover:underline">
                        <h3 className={`font-bold text-lg ${status === 'Closed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {ticket.title}
                        </h3>
                    </Link>
                    <StatusBadge status={status} />
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border 
            ${ticket.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                            ticket.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-green-50 text-green-700 border-green-200'}`}>
                        {ticket.priority}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{ticket.description || 'No description'}</p>
            </div>

            {/* Right Side: Controls */}
            <div className="flex gap-3 items-center">

                {/* Assignee Dropdown */}
                <select
                    className="text-sm p-2 border rounded bg-white focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                    value={assignedTo}
                    onChange={(e) => handleAssignChange(e.target.value)}
                >
                    <option value="">Unassigned</option>
                    {projectMembers.map(member => (
                        <option key={member._id} value={member._id}>
                            {member.username}
                        </option>
                    ))}
                </select>

                {/* Status Dropdown */}
                <select
                    className="text-sm p-2 border rounded font-medium cursor-pointer focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                >
                    <option value="Open">Open</option>
                    <option value="In-Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                </select>

            </div>
        </div>
    );
}