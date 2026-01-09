import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import ticketRoutes from './routes/ticketRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { projectRouter } from './routes/projectRoutes.js';

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Mount the Routes ---
app.use('/api/users', authRoutes);       // Handles Login/Register
app.use('/api/projects', projectRouter); // Handles Creating/Fetching Projects
app.use('/api/tickets', ticketRoutes);   // Handles Ticket operations

// Health Check (Required for Lightsail)
app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});

// Serve Static Assets in Production
if (process.env.NODE_ENV === 'production') {
    console.log("Running in production mode");

    // Point to the 'public' folder relative to this file
    app.use(express.static(path.join(__dirname, '../public')));

    app.get(/(.*)/, (req, res) => {
        res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});