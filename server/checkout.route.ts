/* tslint:disable:no-trailing-whitespace */
import {Request, Response} from 'express';
import {getDocData} from './database';

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

interface RequestInfo {
  courseId: string;
  callbackUrl: string;
}

export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const info: RequestInfo = {
      courseId: req.body.courseId,
      callbackUrl: req.body.callbackUrl
    };

    let sessionConfig;

    if (info.courseId) {
      const course = await getDocData(`courses/${info.courseId}`);

      sessionConfig = setupPurchaseCourseSession(info, course);
    }

    console.log(sessionConfig);

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(session);



    res.status(200).json({
      stripeCheckoutSessionId: session.id,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY
    });
  } catch (e) {
    console.log('Error', e);
    res.status(500).json({error: 'Error'});
  }
}

function setupPurchaseCourseSession(info: RequestInfo, course) {
  const config = setupBaseSessionConfig(info);

  config.line_items = [{
    name: course.titles.description,
    description: course.titles.longDescription,
    amount: course.price * 100,
    currency: 'aud',
    quantity: 1,
  }];

  return config;
}

function setupBaseSessionConfig(info: RequestInfo) {
  const config: any = {
    payment_method_types: ['card'],
    success_url: `${info.callbackUrl}/?purchaseResult=success`,
    cancel_url: `${info.callbackUrl}/?purchaseResult=failed`
  };

  return config;
}
