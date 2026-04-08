import { NextFunction, Response } from 'express';
import HttpStatus from '../utils/http-status';
import { ResourceRequest } from '../utils/types';

export default function blockResources(...names: string[]) {
  return (req: ResourceRequest, res: Response, next: NextFunction) => {
    const { resource: tableName } = req.params;
    if (names.includes(tableName)) {
      res.sendStatus(HttpStatus.NOT_ALLOWED);
      return;
    }
    next();
  };
}
