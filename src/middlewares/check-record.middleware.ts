import { NextFunction, Response } from 'express';
import db from '../database/knex';
import HttpStatus from '../utils/http-status';
import { HttpError, ResourceRequest } from '../utils/types';

export default async function checkRecord(req: ResourceRequest, res: Response, next: NextFunction) {
  const { resource: tableName, id } = req.params;
  
  const result = await db(tableName)
    .where({ id })
    .count('id')
    .first();
  
  const count = +(result?.count ?? 0);
  let err: Error | undefined;
  if (count <= 0) {
    err = new HttpError(HttpStatus.NOT_FOUND, `Resource "${tableName}" with ID=${id} doesn't exist`);
  }
  next(err);
}
