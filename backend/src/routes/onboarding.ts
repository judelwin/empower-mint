import { Router } from 'express';
import * as onboardingController from '../controllers/onboardingController.js';

const router = Router();

router.post('/', onboardingController.completeOnboarding);

export default router;

