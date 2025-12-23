import api from './api';

// Define the shape of the data based on your backend
interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

export const loginUser = async (email: string, password: string) => {
  const response = await api.post<LoginResponse>('/users/login', { email, password });
  
  // Save the token immediately upon success
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    // You might also want to save the user info to Context/State
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

export const registerUser = async (userData: any) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};