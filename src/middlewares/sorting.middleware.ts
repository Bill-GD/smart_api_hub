import { NextFunction } from 'express';
import { checkField } from '../utils/helpers';
import { BadRequestError } from '../utils/http-error';
import { ResourceRequest, ResourceResponse } from '../utils/types';

export default async function sorting(req: ResourceRequest, res: ResourceResponse, next: NextFunction) {
  const { resource: tableName } = req.params;
  const { _sort = 'id', _order } = req.query;
  
  const order = _order ?? (_sort.startsWith('-') ? 'desc' : 'asc');
  const column = _sort.startsWith('-') ? _sort.substring(1) : _sort;
  
  if (!(await checkField(tableName, column))) {
    next(new BadRequestError(`Field "${column}" doesn't exist for resource "${tableName}"`));
    return;
  }
  
  res.locals.sorting = {
    field: column,
    order,
  };
  next();
}
