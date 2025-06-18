import { Router } from 'express';
import { 
  createQuestion,
  updateQuestion,
  deleteQuestion,
  batchImportQuestions,
  generateQuestionsWithAI
} from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 所有管理API都需要认证
router.use(authenticateToken);

// 问题管理
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// 批量操作
router.post('/questions/batch-import', batchImportQuestions);
router.post('/questions/ai-generate', generateQuestionsWithAI);

export default router;