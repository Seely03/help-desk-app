import { Router } from 'express';
import { createProject, getProjects,getProjectById} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming this is your auth middleware

const router = Router();

// POST /api/projects
// Protected by verifyToken because we need req.user.id
router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);

export const projectRouter = router;