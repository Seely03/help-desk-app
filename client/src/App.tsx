import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
// IMPORT the real dashboard file here
import Dashboard from './components/Dashboard'; 
import ProjectDetails from './components/ProjectDetails';
import CreateProject from './components/CreateProject';
import AdminUserManagement from './components/AdminUserManagement';
import TicketDetails from './components/TicketDetails';
import './index.css';

// DELETE the inline 'function Dashboard() { ... }' completely!

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* The Real Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Project Routes */}
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;