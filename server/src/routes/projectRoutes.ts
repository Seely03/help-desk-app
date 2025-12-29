import { Router } from 'express';
import { createProject, getProjects, getProjectById, addMember} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming this is your auth middleware

const router = Router();

// POST /api/projects
// Protected by verifyToken because we need req.user.id
router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);

router.put('/:id/members', protect, addMember);

export const projectRouter = router;