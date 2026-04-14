import { Router } from 'express';
import { createAudience, deleteAudience, getAudiences, updateAudience } from '../controllers/audiences.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getAudiences);
router.post('/', requireAuth, createAudience);
router.patch('/:id', requireAuth, updateAudience);
router.delete('/:id', requireAuth, deleteAudience);

export default router;
