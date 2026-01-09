import express from 'express';
import { registerUser, loginUser, searchUsers, createUser, getAllUsers, updateUser, deleteUser} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/search', protect, searchUsers);

// Admin Routes (The new stuff!)

router.route('/')
  .post(protect, admin, createUser) // Create new user
  .get(protect, admin, getAllUsers); // List all users

router.route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;