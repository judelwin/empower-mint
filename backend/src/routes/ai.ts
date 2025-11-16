import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';

const router = Router();

router.post('/explain', aiController.explainConcept);
router.post('/simulate-wealth', aiController.simulateWealth);
router.post('/scenarios/:id/reflect', aiController.reflectScenarioDecision);

export default router;

