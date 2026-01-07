import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from './Layout';
import SkeletonLoader from './SkeletonLoader';
import StatusBadge from './StatusBadge';

interface Project {
  _id: string;
  name: string;
  description: string;
}

interface Ticket {
  _id: string;
  title: string;
  priority: string;
  status: string;
  project: { name: string };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        const projectRes = await api.get('/projects');
        setProjects(projectRes.data);

        // Fetch Tickets assigned to me
        const ticketRes = await api.get(`/tickets?assignedTo=${parsedUser._id}&status=Open`);
        setTickets(ticketRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <Layout user={user}>
        <SkeletonLoader />
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">Welcome back, {user?.username}. Here is your overview.</p>
      </div>

      <div className="space-y-10">
        
        {/* --- PROJECTS SECTION --- */}
        <section>
          <div className="flex justify-between items-end mb-4 border-b pb-2">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              📂 Your Projects
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{projects.length}</span>
            </h3>
            <button 
              onClick={() => navigate('/create-project')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded transition"
            >
              + New Project
            </button>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 mb-2">You aren't part of any projects yet.</p>
              <button onClick={() => navigate('/create-project')} className="text-blue-600 font-bold hover:underline">Create one now</button>
            </div>
          ) : (
            // GRID LAYOUT FOR PROJECTS
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div 
                  key={proj._id} 
                  onClick={() => navigate(`/projects/${proj._id}`)}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors truncate pr-2">
                      {proj.name}
                    </h4>
                    {/* Optional Icon/Badge */}
                    <span className="text-gray-300 group-hover:text-blue-400">↗</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 h-10">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- TICKETS SECTION --- */}
        <section>
          <div className="flex justify-between items-end mb-4 border-b pb-2">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🎫 Assigned Tickets
              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{tickets.length}</span>
            </h3>
          </div>
          
          {tickets.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">Good news! You have no open tickets.</p>
            </div>
          ) : (
            // GRID LAYOUT FOR TICKETS
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div 
                  key={ticket._id}
                  onClick={() => navigate(`/tickets/${ticket._id}`)}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all flex flex-col justify-between h-40"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        {ticket.project?.name || 'Unknown Project'}
                      </span>
                      {/* Use your Badge component if you have it, otherwise fallback to styled span */}
                      {StatusBadge ? (
                        <StatusBadge status={ticket.priority} type="priority" />
                      ) : (
                         <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            ticket.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                         }`}>{ticket.priority}</span>
                      )}
                    </div>
                    
                    <h4 className="font-bold text-gray-800 leading-tight mb-2 line-clamp-2">
                      {ticket.title}
                    </h4>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t mt-2">
                    <span>Status: <span className="font-semibold text-gray-700">{ticket.status}</span></span>
                    <span className="text-blue-600 font-semibold group-hover:underline">View Details &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </Layout>
  );
}