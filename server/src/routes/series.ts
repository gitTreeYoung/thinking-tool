import { Router } from 'express';
import { 
  getAllSeries,
  getSeriesById,
  getSeriesQuestions,
  createSeries,
  updateSeries,
  deleteSeries,
  addQuestionToSeries,
  removeQuestionFromSeries,
  updateQuestionOrder
} from '../controllers/seriesController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 所有系列API都需要认证
router.use(authenticateToken);

// 系列管理
router.get('/', getAllSeries);
router.get('/:id', getSeriesById);
router.get('/:id/questions', getSeriesQuestions);
router.post('/', createSeries);
router.put('/:id', updateSeries);
router.delete('/:id', deleteSeries);

// 系列问题管理
router.post('/:seriesId/questions', addQuestionToSeries);
router.delete('/:seriesId/questions/:questionId', removeQuestionFromSeries);
router.put('/:seriesId/questions/order', updateQuestionOrder);

export default router;