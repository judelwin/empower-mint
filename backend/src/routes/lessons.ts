import { Router } from 'express';
import * as lessonController from '../controllers/lessonController.js';

const router = Router();

router.get('/', lessonController.getLessons);
router.get('/:id', lessonController.getLessonById);
router.post('/:id/complete', lessonController.completeLesson);

export default router;

