import { Router } from 'express';
import {
  trackOpen,
  trackClick,
  unsubscribe,
  getCampaignAnalytics,
  getOverallAnalytics,
  getCampaignRecipientStatuses,
} from '../controllers/tracking.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Public tracking endpoints (no auth needed - called from emails)
router.get('/open/:campaignId/:contactId', trackOpen);
router.get('/click/:campaignId/:contactId', trackClick);
router.get('/unsubscribe/:contactId', unsubscribe);

// Protected analytics endpoints
router.get('/analytics/overview', requireAuth, getOverallAnalytics);
router.get('/analytics/:campaignId', requireAuth, getCampaignAnalytics);
router.get('/analytics/:campaignId/recipients', requireAuth, getCampaignRecipientStatuses);

export default router;
