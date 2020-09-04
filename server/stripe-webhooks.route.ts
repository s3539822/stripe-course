/* tslint:disable:no-trailing-whitespace */
import {Request, Response} from 'express';
import {db, getDocData} from './database';

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

export async function stripeWebhooks(req: Request, res: Response) {
  try {
    const signature = req.headers['stripe-signature'];

    const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_TEST_SECRET);

    console.log(event.type, event);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await onCheckoutSessionCompleted(session);
    }

    res.json({received: true});
  } catch (e) {
    console.log('Error', e);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }
}

async function onCheckoutSessionCompleted(session) {
  const purchaseSessionId = session.client_reference_id;

  const {userId, courseId} = await getDocData(`purchasedSessions/${purchaseSessionId}`);

  if (courseId) {
    await fulfillCoursePurchase(userId, courseId, purchaseSessionId);
  }
}

async function fulfillCoursePurchase(userId: string, courseId: string, purchaseSessionId: string) {
  const batch = await db.batch();

  const purchaseSessionRef = db.doc(`purchasedSessions/${purchaseSessionId}`);

  batch.update(purchaseSessionRef, {status: 'completed'});

  const userCoursesOwnedRef = db.doc(`users/${userId}/coursesOwned/${courseId}`);

  batch.create(userCoursesOwnedRef, {});

  return batch.commit();
}
