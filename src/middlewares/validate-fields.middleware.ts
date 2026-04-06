import { NextFunction } from 'express';
import db from '../database/knex';
import HttpStatus from '../utils/http-status';
import { HttpError, ResourceRequest, ResourceResponse } from '../utils/types';

export default async function validateFields(req: ResourceRequest, res: ResourceResponse, next: NextFunction) {
  const { resource: tableName } = req.params;
  const { _fields } = req.query;
  
  if (!_fields) {
    res.locals.columns = [`${tableName}.*`];
    next();
    return;
  }
  
  const tableColumns: string[] = (await db('information_schema.columns')
    .select('column_name')
    .where({
      table_schema: 'public',
      table_name: tableName,
    }))
    .map((v) => v['column_name']);
  
  const columns = [];
  for (const field of _fields.split(',')) {
    if (tableColumns.includes(field)) {
      columns.push(`${tableName}.${field}`);
      continue;
    }
    
    next(new HttpError(
      HttpStatus.BAD_REQUEST,
      `Field "${field}" doesn't exist for resource "${tableName}"`,
    ));
    return;
  }
  
  res.locals.columns = columns;
  next();
}
