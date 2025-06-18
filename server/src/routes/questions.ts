import { Router } from 'express';
import { getAllQuestions, getQuestionById } from '../controllers/questionsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getAllQuestions);
router.get('/:id', authenticateToken, getQuestionById);

export default router;