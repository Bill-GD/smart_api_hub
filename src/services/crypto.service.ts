import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../utils/types';

export default class CryptoService {
  static hashPassword(password: string) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync());
  }
  
  static verifyPassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }
  
  static generateToken(payload: User) {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
  }
  
  static verifyToken(token: string): User {
    return <User>jwt.verify(token, process.env.JWT_SECRET!);
  }
}
