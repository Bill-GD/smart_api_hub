import { NextFunction, Request, Response } from 'express';
import { RateLimitedError } from '../utils/http-error';

function createLimiter() {
  const storage = new Map<string, number[]>();
  
  return (max: number, windowMs: number = 60_000) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip,
        method = req.method.toLowerCase(),
        route = req.baseUrl + req.route.path,
        timestamp = Date.now();
      
      const key = `${ip}|${method}|${route}`;
      const bucket = storage.get(key);
      
      if (!bucket) {
        storage.set(key, [timestamp]);
      } else {
        const newBucket = bucket.filter((t) => t > timestamp - windowMs);
        if (newBucket.length >= max) {
          next(new RateLimitedError());
          return;
        }
        
        newBucket.push(timestamp);
        storage.set(key, newBucket);
      }
      
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - (storage.get(key)?.length ?? 0));
      next();
    };
  };
}

const ratelimit = createLimiter();
export default ratelimit;
