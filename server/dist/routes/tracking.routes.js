"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tracking_controller_1 = require("../controllers/tracking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public tracking endpoints (no auth needed - called from emails)
router.get('/open/:campaignId/:contactId', tracking_controller_1.trackOpen);
router.get('/click/:campaignId/:contactId', tracking_controller_1.trackClick);
router.get('/unsubscribe/:contactId', tracking_controller_1.unsubscribe);
// Protected analytics endpoints
router.get('/analytics/overview', auth_middleware_1.requireAuth, tracking_controller_1.getOverallAnalytics);
router.get('/analytics/:campaignId', auth_middleware_1.requireAuth, tracking_controller_1.getCampaignAnalytics);
router.get('/analytics/:campaignId/recipients', auth_middleware_1.requireAuth, tracking_controller_1.getCampaignRecipientStatuses);
exports.default = router;
