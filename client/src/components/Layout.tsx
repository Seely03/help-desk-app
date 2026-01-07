import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';

interface LayoutProps {
  children: ReactNode;
  user: any;
}

export default function Layout({ children, user }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Helper to highlight active links
  const isActive = (path: string) => 
    location.pathname === path 
      ? 'bg-blue-800 text-white' 
      : 'text-blue-100 hover:bg-blue-800 hover:text-white';

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      
      {/* TOP NAVIGATION BAR */}
      <nav className="bg-blue-900 text-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Side: Logo & Links */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <h1 className="text-xl font-extrabold tracking-tight">
                  HelpDesk<span className="text-blue-400">.io</span>
                </h1>
              </div>

              {/* Desktop Nav Links */}
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-4">
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')}`}
                  >
                    Dashboard
                  </Link>
                  
                  <Link 
                    to="/create-project" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/create-project')}`}
                  >
                    New Project
                  </Link>

                  {user?.isAdmin && (
                    <Link 
                      to="/admin/users" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/users')}`}
                    >
                      Users
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: User Profile & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-bold leading-none">{user?.username}</span>
                <span className="text-xs text-blue-300 leading-none mt-1">{user?.email}</span>
              </div>
              
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm shadow-inner">
                {user?.username?.[0]?.toUpperCase()}
              </div>

              <button 
                onClick={handleLogout}
                className="ml-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {children}
      </main>

    </div>
  );
}