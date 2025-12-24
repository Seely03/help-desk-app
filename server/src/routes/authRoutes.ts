import express from 'express';
// Make sure to import BOTH registerUser and loginUser
import { registerUser, loginUser } from '../controllers/authController.js'; 

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser); // <--- Link the new function here

export default router;