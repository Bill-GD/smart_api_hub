import express from 'express';
import HealthController from '../controllers/health.controller';
import ratelimit from '../middlewares/rate-limit.middleware';

const router = express.Router();

router.get('/', ratelimit(5, 10_000), HealthController.index);

export default router;
