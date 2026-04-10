import { Router } from 'express';
import { getCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign, sendCampaign } from '../controllers/campaigns.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getCampaigns);
router.get('/:id', requireAuth, getCampaign);
router.post('/', requireAuth, createCampaign);
router.patch('/:id', requireAuth, updateCampaign);
router.delete('/:id', requireAuth, deleteCampaign);
router.post('/:id/send', requireAuth, sendCampaign);

export default router;
