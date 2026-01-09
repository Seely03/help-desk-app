import express from 'express';
import { createTicket, getTickets, updateTicket, getTicketById} from '../controllers/ticketController.js';
import { protect } from '../middleware/authMiddleware.js';
import { addComment, getComments } from '../controllers/commenController.js';

const router = express.Router();

// Define the endpoints
router.route('/')
    .get(protect, getTickets)   // Protected: Only logged-in users can get tickets
    .post(protect, createTicket);

router.get('/:id', protect, getTicketById);    
router.put('/:id', protect, updateTicket)

router.post('/:ticketId/comments', protect, addComment);
router.get('/:ticketId/comments', protect, getComments);

export default router;