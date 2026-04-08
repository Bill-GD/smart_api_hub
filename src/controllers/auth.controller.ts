import type { Request, Response } from 'express';
import db from '../database/knex';
import CryptoService from '../services/crypto.service';
import { HttpError } from '../utils/http-error';
import HttpStatus from '../utils/http-status';
import { User } from '../utils/types';

export default class AuthController {
  static async register(req: Request, res: Response) {
    const payload = req.body;
    
    const user: User = await db('users')
      .select('username', 'email', 'password', 'role')
      .where({ email: payload.email })
      .first();
    
    if (user) {
      throw new HttpError(HttpStatus.CONFLICT, 'Email already registered');
    }
    
    await db('users').insert({
      ...payload,
      password: CryptoService.hashPassword(payload.password),
      role: 'user',
    });
    
    res.status(HttpStatus.CREATED).json({ message: 'Registered successfully' });
  }
  
  static async login(req: Request, res: Response) {
    const payload = req.body;
    
    const user: User = await db('users')
      .select('id', 'username', 'email', 'password', 'role')
      .where({ email: payload.email })
      .first();
    
    if (!user || !CryptoService.verifyPassword(payload.password, user!.password)) {
      throw new HttpError(HttpStatus.FORBIDDEN, 'Wrong credentials');
    }
    
    res.status(HttpStatus.OK).json({ token: CryptoService.generateToken(user) });
  }
}
