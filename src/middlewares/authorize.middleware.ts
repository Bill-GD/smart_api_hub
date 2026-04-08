import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import CryptoService from '../services/crypto.service';
import { ForbiddenError, HttpError } from '../utils/http-error';
import HttpStatus from '../utils/http-status';

export default function authorize(...roles: ('user' | 'admin')[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const { authorization: auth } = req.headers;
    
    if (!auth || !auth.startsWith('Bearer') || !auth!.split(' ')[1]) {
      next(new HttpError(HttpStatus.BAD_REQUEST, 'Bearer token not provided'));
      return;
    }
    
    const token = auth!.split(' ')[1]!;
    
    try {
      const user = CryptoService.verifyToken(token);
      if (!roles.includes(user.role)) {
        next(new ForbiddenError('Access to resource and/or method not allowed'));
        return;
      }
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        next(new ForbiddenError('Invalid token'));
        return;
      }
    }
    next();
  };
}
