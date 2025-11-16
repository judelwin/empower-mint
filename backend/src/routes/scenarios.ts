import { Router } from 'express';
import * as scenarioController from '../controllers/scenarioController.js';

const router = Router();

router.get('/', scenarioController.getScenarios);
router.get('/:id', scenarioController.getScenarioById);
router.post('/:id/decision', scenarioController.makeDecision);
router.post('/:id/complete', scenarioController.completeScenario);

export default router;

