import express from 'express';
import { getTickets, createTicket } from '../controllers/ticketController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Define the endpoints
router.route('/')
    .get(getTickets)                    // Public: Anyone can see tickets
    .post(protect, createTicket);       // Protected: Only logged-in users can create

export default router;