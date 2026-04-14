"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBillingInfo = exports.handleWebhook = exports.createCheckoutSession = void 0;
const stripe_1 = __importDefault(require("stripe"));
const prisma_1 = require("../prisma");
const config_1 = require("../config");
const stripe = config_1.appConfig.stripeSecretKey
    ? new stripe_1.default(config_1.appConfig.stripeSecretKey, {
        apiVersion: '2026-03-25.dahlia',
    })
    : null;
const PLANS = {
    starter: { priceId: 'price_starter_monthly', name: 'Starter' },
    pro: { priceId: 'price_pro_monthly', name: 'Pro' },
    business: { priceId: 'price_business_monthly', name: 'Business' },
};
// Create Stripe checkout session
const createCheckoutSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const { plan } = req.body;
        if (!plan || !PLANS[plan]) {
            return res.status(400).json({ message: 'Invalid plan' });
        }
        const user = yield prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        if (!stripe) {
            yield prisma_1.prisma.user.update({
                where: { id: userId },
                data: { plan: PLANS[plan].name },
            });
            return res.json({
                url: `${config_1.appConfig.frontendUrl}/payment-gateway?mode=mock&plan=${plan}`,
                mock: true,
            });
        }
        // Create or retrieve Stripe customer
        let customerId = user.stripeId;
        if (!customerId) {
            const customer = yield stripe.customers.create({
                email: user.email,
                name: user.name || undefined,
                metadata: { userId: user.id },
            });
            customerId = customer.id;
            yield prisma_1.prisma.user.update({
                where: { id: userId },
                data: { stripeId: customerId },
            });
        }
        const frontendUrl = config_1.appConfig.frontendUrl;
        const session = yield stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: PLANS[plan].priceId,
                    quantity: 1,
                },
            ],
            success_url: `${frontendUrl}/dashboard?payment=success&plan=${plan}`,
            cancel_url: `${frontendUrl}/pricing?payment=cancelled`,
            metadata: { userId, plan },
        });
        res.json({ url: session.url });
    }
    catch (error) {
        console.error('Create checkout session error:', error);
        res.status(500).json({ message: 'Failed to create checkout session' });
    }
});
exports.createCheckoutSession = createCheckoutSession;
// Stripe webhook handler
const handleWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!stripe) {
        return res.status(400).json({ message: 'Stripe is not configured' });
    }
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
            const plan = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.plan;
            if (userId && plan && PLANS[plan]) {
                yield prisma_1.prisma.user.update({
                    where: { id: userId },
                    data: { plan: PLANS[plan].name },
                });
            }
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const customer = yield stripe.customers.retrieve(subscription.customer);
            if ('metadata' in customer && customer.metadata.userId) {
                yield prisma_1.prisma.user.update({
                    where: { id: customer.metadata.userId },
                    data: { plan: 'Starter' },
                });
            }
            break;
        }
    }
    res.json({ received: true });
});
exports.handleWebhook = handleWebhook;
// Get billing info
const getBillingInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const user = yield prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json({
            plan: user.plan,
            stripeId: user.stripeId,
        });
    }
    catch (error) {
        console.error('Get billing info error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getBillingInfo = getBillingInfo;
