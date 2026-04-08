import express from 'express';
import AuthController from '../controllers/auth.controller';
import ratelimit from '../middlewares/rate-limit.middleware';
import validateAuth from '../middlewares/validate-auth.middleware';

const router = express.Router();

router.use(validateAuth);
router.post('/register', ratelimit(5, 10_000), AuthController.register);
router.post('/login', ratelimit(5, 10_000), AuthController.login);

export default router;
