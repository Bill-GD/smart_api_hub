import { NextFunction, Request } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import CryptoService from '../services/crypto.service';
import { ForbiddenError, HttpError } from '../utils/http-error';
import HttpStatus from '../utils/http-status';
import { ResourceResponse } from '../utils/types';

export default function authorize(...roles: ('user' | 'admin')[]) {
  return async (req: Request, res: ResourceResponse, next: NextFunction) => {
    const { authorization: auth } = req.headers;
    
    if (!auth || !auth.startsWith('Bearer') || !auth!.split(' ')[1]) {
      next(new HttpError(HttpStatus.UNAUTHORIZED, 'Bearer token not provided'));
      return;
    }
    
    const token = auth!.split(' ')[1]!;
    
    try {
      const user = CryptoService.verifyToken(token);
      if (!roles.includes(user.role)) {
        next(new ForbiddenError('Access to resource and/or method not allowed'));
        return;
      }
      res.locals.user = user;
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        next(new HttpError(HttpStatus.UNAUTHORIZED, 'Invalid token'));
        return;
      }
    }
    next();
  };
}
