import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validate, createTaskSchema, updateTaskSchema, taskQuerySchema } from '../middleware/validate';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/stats', taskController.getStats);
router.get('/',      validate(taskQuerySchema, 'query'), taskController.getTasks);
router.post('/',     validate(createTaskSchema),         taskController.createTask);
router.get('/:id',   taskController.getTask);
router.patch('/:id', validate(updateTaskSchema),         taskController.updateTask);
router.delete('/:id',                                    taskController.deleteTask);

export default router;
