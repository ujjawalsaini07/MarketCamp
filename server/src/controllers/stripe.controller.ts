import { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../prisma';
import { appConfig } from '../config';

const stripe = appConfig.stripeSecretKey
  ? new Stripe(appConfig.stripeSecretKey, {
      apiVersion: '2026-03-25.dahlia',
    })
  : null;

const PLANS: Record<string, { priceId: string; name: string }> = {
  starter: { priceId: 'price_starter_monthly', name: 'Starter' },
  pro: { priceId: 'price_pro_monthly', name: 'Pro' },
  business: { priceId: 'price_business_monthly', name: 'Business' },
};

// Create Stripe checkout session
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user.id);
    const { plan } = req.body;

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!stripe) {
      await prisma.user.update({
        where: { id: userId },
        data: { plan: PLANS[plan].name },
      });
      return res.json({
        url: `${appConfig.frontendUrl}/payment-gateway?mode=mock&plan=${plan}`,
        mock: true,
      });
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeId: customerId },
      });
    }

    const frontendUrl = appConfig.frontendUrl;

    const session = await stripe.checkout.sessions.create({
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
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

// Stripe webhook handler
export const handleWebhook = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(400).json({ message: 'Stripe is not configured' });
  }
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (userId && plan && PLANS[plan]) {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: PLANS[plan].name },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any;
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      if ('metadata' in customer && customer.metadata.userId) {
        await prisma.user.update({
          where: { id: customer.metadata.userId },
          data: { plan: 'Starter' },
        });
      }
      break;
    }
  }

  res.json({ received: true });
};

// Get billing info
export const getBillingInfo = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      plan: user.plan,
      stripeId: user.stripeId,
    });
  } catch (error) {
    console.error('Get billing info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
