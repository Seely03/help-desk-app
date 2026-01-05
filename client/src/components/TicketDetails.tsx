import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from './Layout';
import StatusBadge from './StatusBadge';

export default function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [ticket, setTicket] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);


    const refreshComments = async () => {
        const res = await api.get(`/tickets/${id}/comments`);
        setComments(res.data);
      };
      
    // Load User and Data
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchData = async () => {
            try {
                const ticketRes = await api.get(`/tickets/${id}`);
                setTicket(ticketRes.data);

                const commentRes = await api.get(`/tickets/${id}/comments`);
                setComments(commentRes.data);
            } catch (err) {
                console.error("Failed to load ticket");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Handle New Comment
    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await api.post(`/tickets/${id}/comments`, { content: newComment });
            setComments([...comments, res.data]);
            setNewComment('');
        } catch (err) {
            alert('Failed to post comment');
        }
    };

    // Handle Updates (Status/Priority/Assignee)
    const handleUpdateTicket = async (updates: any) => {
        // 1. Prepare the Optimistic Update
        // We clone the updates so we don't mess up the API payload
        let stateUpdates = { ...updates };

        // SPECIAL HANDLING: If we are changing the assignee
        if (updates.assignedTo) {
            // Find the actual User Object from the project members list
            // This ensures 'assignedTo' stays an Object, not a String
            const newUser = ticket.project.members.find((m: any) => m._id === updates.assignedTo);
            stateUpdates.assignedTo = newUser;
        }
        else if (updates.assignedTo === "") {
            // Handle "Unassigned" case
            stateUpdates.assignedTo = null;
        }

        // 2. Update UI Immediately (with the Object)
        setTicket({ ...ticket, ...updates });

        try {
            // 3. Send API Request (with the String ID)
            await api.put(`/tickets/${id}`, updates);
            refreshComments();
        } catch (err) {
            console.error(err);
            alert('Failed to update ticket');
            // Optional: Revert state here if you want to be perfect
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!ticket) return <div className="p-8">Ticket not found</div>;

    return (
        <Layout user={user}>
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Back Link */}
            <button
                onClick={() => navigate(`/projects/${ticket.project._id}`)} // Go back to Project
                className="text-blue-600 mb-4 hover:underline flex items-center gap-1"
            >
                &larr; Back to Project
            </button>

            <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">

                {/* LEFT COLUMN: Content & Discussion */}
                <div className="flex-1">
                    <div className="bg-white p-6 rounded shadow mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
                            <StatusBadge status={ticket.status} />
                        </div>
                        <p className="text-gray-500 mb-4">
                            Created on {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                        <div className="bg-gray-50 p-4 rounded text-gray-700 whitespace-pre-wrap">
                            {ticket.description || 'No description provided.'}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-xl font-bold mb-6">Discussion</h3>

                        <div className="space-y-6 mb-8">
                            {comments.length === 0 && <p className="text-gray-400 italic">No comments yet.</p>}

                            {comments.map((comment) => (
                                <div key={comment._id} className="mb-4">

                                    {/* RENDER SYSTEM LOG (Centered, Gray) */}
                                    {comment.isSystem ? (
                                        <div className="flex items-center justify-center my-4">
                                            <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500 flex items-center gap-2 border">
                                                <span className="font-bold">{comment.author?.username}</span>
                                                <span>{comment.content}</span>
                                                <span className="text-gray-400">• {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    ) : (

                                        /* RENDER USER MESSAGE (Normal Bubble) */
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                                {comment.author?.username?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="font-bold text-gray-900">{comment.author?.username}</span>
                                                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                                                </div>
                                                <div className="bg-white p-3 border rounded-lg shadow-sm text-gray-800">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handlePostComment}>
                            <textarea
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold disabled:opacity-50"
                                    disabled={!newComment.trim()}
                                >
                                    Post Comment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar Metadata */}
                <div className="w-full md:w-80 space-y-6">
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Details</h3>

                        {/* Status */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full p-2 border rounded bg-gray-50"
                                value={ticket.status}
                                onChange={(e) => handleUpdateTicket({ status: e.target.value })}
                            >
                                <option value="Open">Open</option>
                                <option value="In-Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                className="w-full p-2 border rounded bg-gray-50"
                                value={ticket.priority}
                                onChange={(e) => handleUpdateTicket({ priority: e.target.value })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        {/* Assignee */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                            <select
                                className="w-full p-2 border rounded bg-gray-50"
                                // FIX: Handle both Object (from DB) and String (from local update)
                                value={
                                    ticket.assignedTo && typeof ticket.assignedTo === 'object'
                                        ? ticket.assignedTo._id
                                        : ticket.assignedTo || ''
                                }
                                onChange={(e) => handleUpdateTicket({ assignedTo: e.target.value })}
                            >
                                <option value="">Unassigned</option>

                                {/* FIX: Ensure members exist before mapping */}
                                {ticket.project?.members?.map((m: any) => (
                                    <option key={m._id} value={m._id}>
                                        {m.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        </Layout>
    );
}