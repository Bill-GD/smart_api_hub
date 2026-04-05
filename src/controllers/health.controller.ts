import type { Request, Response } from 'express';
import db from '../database/knex';
import HttpStatus from '../utils/http-status';

export default class HealthController {
  static async index(_req: Request, res: Response) {
    let dbStatus = false;
    try {
      await db.raw('select 1');
      dbStatus = true;
    } catch (e) {
    }
    
    res.status(HttpStatus.OK).json({
      webStatus: 'ok',
      webUptime: process.uptime(),
      databaseClient: db.getClient(),
      databaseStatus: dbStatus ? 'ok' : 'disconnected',
    });
  }
}
