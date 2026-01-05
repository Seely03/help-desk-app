import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from './Layout';
import AddMemberForm from './AddMemberForm';
import TicketItem from './TicketItem';

export default function ProjectDetails() {
    const { id } = useParams(); // Get the ID from the URL
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [project, setProject] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State for new Ticket
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [ticketTitle, setTicketTitle] = useState('');
    const [ticketDesc, setTicketDesc] = useState('');
    const [priority, setPriority] = useState('Medium');

    const handleProjectUpdated = (updatedProject: any) => {
        setProject(updatedProject);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchProjectData = async () => {
            try {
                // 1. Fetch Project Details
                const projRes = await api.get(`/projects/${id}`);
                setProject(projRes.data);

                // 2. Fetch Tickets for this Project
                const ticketRes = await api.get(`/tickets?projectId=${id}`);
                setTickets(ticketRes.data);
            } catch (err) {
                console.error("Error loading project", err);
                // Optional: navigate('/dashboard') if not found
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [id]);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/tickets', {
                title: ticketTitle,
                description: ticketDesc,
                priority: priority,
                projectId: id // crucial: link ticket to this project
            });

            // Update UI
            setTickets([res.data.ticket, ...tickets]);
            setShowTicketForm(false);
            setTicketTitle('');
            setTicketDesc('');
        } catch (err) {
            alert('Failed to create ticket');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!project) return <div className="p-8">Project not found</div>;

    return (
        <Layout user={user}>
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Back Button */}
            <button onClick={() => navigate('/dashboard')} className="text-blue-600 mb-4 hover:underline">
                &larr; Back to Dashboard
            </button>

            {/* Project Header */}
            <div className="bg-white p-6 rounded shadow mb-6">
                <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                <p className="text-gray-600">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.members.map((m: any) => (
                        <span key={m._id} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            {m.username}
                            {/* Optional: Add X button to remove member here later */}
                        </span>
                    ))}
                </div>
                <div className="mt-4 max-w-md">
                    <AddMemberForm projectId={project._id} onMemberAdded={handleProjectUpdated} />
                </div>
            </div>


            {/* Tickets Section */}
            <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Tickets</h2>
                    <button
                        onClick={() => setShowTicketForm(!showTicketForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {showTicketForm ? 'Cancel' : '+ New Ticket'}
                    </button>
                </div>

                {/* Create Ticket Form */}
                {showTicketForm && (
                    <form onSubmit={handleCreateTicket} className="mb-8 p-4 bg-gray-100 rounded border">
                        <h3 className="font-bold mb-3">Create New Ticket</h3>
                        <div className="mb-2">
                            <input
                                className="w-full p-2 border rounded"
                                placeholder="Ticket Title"
                                value={ticketTitle}
                                onChange={e => setTicketTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <textarea
                                className="w-full p-2 border rounded"
                                placeholder="Description"
                                value={ticketDesc}
                                onChange={e => setTicketDesc(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <select
                                className="p-2 border rounded"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                            >
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority</option>
                            </select>
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">Save Ticket</button>
                    </form>
                )}

                {/* Ticket List */}
                {/* Ticket List */}
                <div className="mt-6">
                    {tickets.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded border border-dashed">
                            <p className="text-gray-500">No tickets yet. Create one above!</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {tickets.map(ticket => (
                                <TicketItem
                                    key={ticket._id}
                                    ticket={ticket}
                                    projectMembers={project.members} // Pass members down so dropdown works
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
        </Layout>
    );
}