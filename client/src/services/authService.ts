import api from './api';

// --- LOGIN ---
export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/users/login', { email, password });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    
    // We store the user info (excluding sensitive bits if needed)
    // The backend sends a flat object { _id, username, email, ... }
    const userToStore = {
      _id: response.data._id,
      username: response.data.username,
      email: response.data.email,
      isAdmin: response.data.isAdmin,
      jobTitle: response.data.jobTitle
    };
    
    localStorage.setItem('user', JSON.stringify(userToStore));
  }
  
  return response.data;
};

// --- REGISTER (This was missing!) ---
export const registerUser = async (userData: any) => {
  // Pass the form data (username, email, password) to the backend
  const response = await api.post('/users/register', userData);
  return response.data;
};

// --- LOGOUT ---
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Optional: Force a hard reload to clear any memory states
  // window.location.href = '/login'; 
};