import { Router } from 'express';
import { 
  getThoughtsByQuestion, 
  createThought, 
  updateThought, 
  deleteThought 
} from '../controllers/thoughtsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/question/:questionId', authenticateToken, getThoughtsByQuestion);
router.post('/', authenticateToken, createThought);
router.put('/:id', authenticateToken, updateThought);
router.delete('/:id', authenticateToken, deleteThought);

export default router;