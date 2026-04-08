import { NextFunction, Response } from 'express';
import { z } from 'zod';
import { BadRequestError } from '../utils/http-error';
import { ResourceRequest } from '../utils/types';
import { validatorCache } from '../utils/validators';

export default async function validateBody(req: ResourceRequest, res: Response, next: NextFunction) {
  const { resource } = req.params;
  let err: Error | undefined;
  
  try {
    let schema = validatorCache.get(resource);
    if (!schema) {
      err = new Error(`No available zod schema for ${resource}`);
    } else {
      if (req.method === 'PATCH') {
        schema = schema.partial();
      }
      schema.parse(req.body);
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      err = new BadRequestError(e.issues[0]?.message ?? 'Invalid body schema');
    }
  }
  next(err);
}
