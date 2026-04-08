import express from 'express';
import AuthController from '../controllers/auth.controller';
import validateAuth from '../middlewares/validate-auth.middleware';

const router = express.Router();

router.use(validateAuth);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router;
