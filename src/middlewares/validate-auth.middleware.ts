import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { BadRequestError } from '../utils/http-error';
import { LoginSchema, RegisterSchema } from '../utils/validators';

export default async function validateAuth(req: Request, res: Response, next: NextFunction) {
  let err: Error | undefined;
  try {
    switch (req.path) {
      case '/login':
        LoginSchema.parse(req.body);
        break;
      case '/register':
        RegisterSchema.parse(req.body);
        break;
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      err = new BadRequestError(e.issues[0]?.message ?? 'Invalid body schema');
    }
  }
  next(err);
}
