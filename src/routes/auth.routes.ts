import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate, registerSchema, loginSchema, refreshSchema } from '../middleware/validate';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login',    validate(loginSchema),    authController.login);
router.post('/refresh',  validate(refreshSchema),  authController.refresh);
router.post('/logout',   authenticate,             authController.logout);
router.get('/me',        authenticate,             authController.me);

export default router;
