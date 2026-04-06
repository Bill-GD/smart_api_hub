import { NextFunction, Response } from 'express';
import { checkResource } from '../utils/helpers';
import HttpStatus from '../utils/http-status';
import { HttpError, ResourceRequest } from '../utils/types';

export default async function validateResource(req: ResourceRequest, res: Response, next: NextFunction) {
  const { resource: tableName } = req.params;
  let err: Error | undefined;
  if (!(await checkResource(tableName))) {
    err = new HttpError(HttpStatus.BAD_REQUEST, `Resource "${tableName}" doesn't exist`);
  }
  next(err);
}
