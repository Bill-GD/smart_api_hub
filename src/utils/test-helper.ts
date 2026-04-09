import { Response } from 'superagent';
import { expect } from 'vitest';
import db from '../database/knex';

export function mockDBObject() {
  return Object.getPrototypeOf(db('mock'));
}

export function expectHttpError(res: Response, status: number, checkJson: boolean = true) {
  if (checkJson) {
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBeTypeOf('string');
  }
  expect(res.status).toBe(status);
}
