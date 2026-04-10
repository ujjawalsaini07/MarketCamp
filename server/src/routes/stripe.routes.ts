import { Router } from 'express';
import { createCheckoutSession, getBillingInfo } from '../controllers/stripe.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/create-checkout-session', requireAuth, createCheckoutSession);
router.get('/billing', requireAuth, getBillingInfo);

export default router;
