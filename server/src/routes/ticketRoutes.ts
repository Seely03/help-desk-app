import express from 'express';
import { createTicket, getTickets, updateTicket } from '../controllers/ticketController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Define the endpoints
router.route('/')
    .get(protect, getTickets)   // Protected: Only logged-in users can get tickets
    .post(protect, createTicket);       // Protected: Only logged-in users can create
    
router.put('/:id', protect, updateTicket)
export default router;