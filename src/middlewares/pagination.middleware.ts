import { NextFunction } from 'express';
import HttpStatus from '../utils/http-status';
import { HttpError, ResourceRequest, ResourceResponse } from '../utils/types';

export default async function pagination(req: ResourceRequest, res: ResourceResponse, next: NextFunction) {
  const { _page = '1', _limit = '10' } = req.query;
  const page = +_page, limit = +_limit;
  
  if (isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0) {
    next(new HttpError(
      HttpStatus.BAD_REQUEST,
      `Invalid page (${_page}) and/or limit (${_limit})`,
    ));
    return;
  }
  
  res.locals.pagination = {
    offset: (page - 1) * limit,
    limit,
  };
  next();
}
