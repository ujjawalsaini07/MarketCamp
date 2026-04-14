"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripe_controller_1 = require("../controllers/stripe.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/create-checkout-session', auth_middleware_1.requireAuth, stripe_controller_1.createCheckoutSession);
router.get('/billing', auth_middleware_1.requireAuth, stripe_controller_1.getBillingInfo);
exports.default = router;
