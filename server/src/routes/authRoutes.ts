import express from 'express';
// Make sure to import BOTH registerUser and loginUser
import { registerUser, loginUser, searchUsers, createUser, getAllUsers, updateUser, deleteUser} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser); // <--- Link the new function here
router.get('/search', protect, searchUsers);
// Admin Routes (The new stuff!)
// Note: We use BOTH protect (must be logged in) AND admin (must be boss)
router.route('/')
  .post(protect, admin, createUser) // Create new user
  .get(protect, admin, getAllUsers); // List all users

router.route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;