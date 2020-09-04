/* tslint:disable:no-trailing-whitespace */
import {Request, Response} from 'express';

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

export async function stripeWebhooks(req: Request, res: Response) {
  try {
    const signature = req.headers['stripe-signature'];

    const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_TEST_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(session);
    }

    res.json({received: true});
  } catch (e) {
    console.log('Error', e);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }
}
