import express from 'express';
import cors from 'cors';
import connectDB from './db.js';

// Import Routes
import ticketRoutes from './routes/ticketRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { projectRouter } from './routes/projectRoutes.js';

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Mount the Routes ---
app.use('/api/users', authRoutes);       // Handles Login/Register
app.use('/api/projects', projectRouter); // <--- New: Handles Creating/Fetching Projects
app.use('/api/tickets', ticketRoutes);   // Handles Ticket operations

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});