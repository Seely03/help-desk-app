import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';

interface LayoutProps {
  children: ReactNode;
  user: any; // Pass the user object so we know if they are Admin
}

export default function Layout({ children, user }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-800';

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-2xl font-extrabold tracking-tight">HelpDesk<span className="text-blue-400">.io</span></h1>
          <p className="text-xs text-blue-300 mt-1">v1.0.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className={`block px-4 py-3 rounded-lg font-medium transition-all ${isActive('/dashboard')}`}>
            📊 Dashboard
          </Link>
          
          <Link to="/create-project" className={`block px-4 py-3 rounded-lg font-medium transition-all ${isActive('/create-project')}`}>
            🚀 New Project
          </Link>

          {/* Admin Only Link */}
          {user?.isAdmin && (
            <Link to="/admin/users" className={`block px-4 py-3 rounded-lg font-medium transition-all ${isActive('/admin/users')}`}>
               🔧 User Management
            </Link>
          )}
        </nav>

        {/* User Profile Snippet */}
        <div className="p-4 bg-blue-950 border-t border-blue-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-lg">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold truncate">{user?.username}</p>
              <p className="text-xs text-blue-300 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-semibold transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}