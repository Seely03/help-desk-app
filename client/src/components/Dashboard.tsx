import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { logoutUser } from '../services/authService';
import Layout from './Layout';

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

  // New State for "Create Project"
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

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
        // Fetch Projects
        const projectRes = await api.get('/projects');
        setProjects(projectRes.data);

        // Fetch Tickets
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

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // New Function: Handle Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', {
        name: newProjectName,
        description: newProjectDesc
      });

      // Add the new project to the list immediately (Optimistic UI)
      setProjects([res.data.project, ...projects]);

      // Reset form
      setNewProjectName('');
      setNewProjectDesc('');
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create project", err);
      alert("Failed to create project");
    }
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <Layout user={user}>
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          
          {/* Admin Badge/Link */}
          {user?.isAdmin && (
            <button 
              onClick={() => navigate('/admin/users')}
              className="mt-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold hover:bg-red-200 transition"
            >
              🔧 Manage Users (Admin)
            </button>
          )}
        </div>
        
        <button 
          onClick={handleLogout} 
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Projects Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Your Projects</h2>

            <button
              onClick={() => navigate('/create-project')} // <--- Navigate to new page
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
            >
              + New Project
            </button>
          </div>


          {/* Create Project Form (Visible only when toggled) */}
          {showCreateForm && (
            <form onSubmit={handleCreateProject} className="mb-6 p-4 bg-blue-50 rounded border border-blue-100">
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  required
                />
              </div>
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Description (Optional)"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              <button type="submit" className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">
                Create
              </button>
            </form>
          )}

          {/* Project List */}
          {projects.length === 0 ? (
            <p className="text-gray-500 italic">You haven't joined any projects yet.</p>
          ) : (
            <ul className="space-y-3">
              {projects.map((proj) => (
                <li
                  key={proj._id}
                  className="border-b pb-2 last:border-0 cursor-pointer hover:bg-gray-50 p-2 transition"
                  onClick={() => navigate(`/projects/${proj._id}`)} // <--- Add navigation
                >
                  <h3 className="font-semibold text-blue-600">{proj.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{proj.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tickets Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Assigned Tickets (Open)</h2>

          {tickets.length === 0 ? (
            <p className="text-gray-500 italic">No open tickets assigned to you.</p>
          ) : (
            <ul className="space-y-3">
              {tickets.map((ticket) => (
                <li key={ticket._id} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <div>
                    <h3 className="font-medium">{ticket.title}</h3>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700 ml-2">
                      {ticket.project?.name || 'Unknown Project'}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-bold 
                    ${ticket.priority === 'High' ? 'bg-red-100 text-red-700' :
                      ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'}`}>
                    {ticket.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div >
    </Layout>
  );
}