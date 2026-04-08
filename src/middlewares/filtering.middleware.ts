import { NextFunction } from 'express';
import { checkField } from '../utils/helpers';
import { HttpError } from '../utils/http-error';
import HttpStatus from '../utils/http-status';
import { ResourceRequest, ResourceResponse } from '../utils/types';

const opMapping: Record<string, string> = {
  '_eq': '=',
  '_ne': '!=',
  '_gte': '>=',
  '_lte': '<=',
  '_gt': '>',
  '_lt': '<',
} as const;

export default async function filtering(req: ResourceRequest, res: ResourceResponse, next: NextFunction) {
  const { resource: tableName } = req.params;
  const queries = req.query;
  
  const whereClauses: { field: string; op: string; value: string; }[] = [];
  
  for (const [query, value] of Object.entries(queries)) {
    if (query.startsWith('_') || query === 'q') continue;
    
    const split = query.split(':');
    const [field, op = '_eq'] = [split[0]!, split[1]];
    
    if (!(await checkField(tableName, field))) {
      next(new HttpError(
        HttpStatus.BAD_REQUEST,
        `Field "${field}" doesn't exist for resource "${tableName}"`,
      ));
      return;
    }
    
    whereClauses.push({
      field,
      op: opMapping[op] ?? op,
      value,
    });
  }
  res.locals.filtering = whereClauses;
  next();
}
