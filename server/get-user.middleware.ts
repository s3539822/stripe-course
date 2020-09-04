/* tslint:disable:no-trailing-whitespace */
import {Request, Response, NextFunction} from 'express';
import {auth} from './auth';

export function getUserMiddleWare(req: Request, res: Response, next: NextFunction) {

  const jwt = req.headers.authorization;

  if (jwt) {
    auth.verifyIdToken(jwt)
      .then(jwtPayload => {
        req['uid'] = jwtPayload.uid;
        next();
      })
      .catch(err => {
        console.log('Error', err);
        res.status(403).json({message: 'error'});
      });
  } else {
    next();
  }
}
