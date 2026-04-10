import { Router } from 'express';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../controllers/templates.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getTemplates);
router.post('/', requireAuth, createTemplate);
router.patch('/:id', requireAuth, updateTemplate);
router.delete('/:id', requireAuth, deleteTemplate);

export default router;
