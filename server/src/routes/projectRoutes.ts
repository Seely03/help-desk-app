import { Router } from 'express';
import { createProject, getProjects } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming this is your auth middleware

const router = Router();

// POST /api/projects
// Protected by verifyToken because we need req.user.id
router.post('/', protect, createProject);
router.get('/', protect, getProjects)

export const projectRouter = router;