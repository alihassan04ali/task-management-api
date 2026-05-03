import { Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';
import { AuthRequest, PaginationQuery } from '../types';

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await taskService.createTask(req.body, req.user!.id);
    res.status(201).json({ success: true, message: 'Task created', data: { task } });
  } catch (err) { next(err); }
};

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tasks, meta } = await taskService.getTasks(req.user!.id, req.user!.role, req.query as PaginationQuery);
    res.status(200).json({ success: true, message: 'Tasks retrieved', data: { tasks }, meta });
  } catch (err) { next(err); }
};

export const getTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user!.id, req.user!.role);
    res.status(200).json({ success: true, message: 'Task retrieved', data: { task } });
  } catch (err) { next(err); }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user!.id, req.user!.role);
    res.status(200).json({ success: true, message: 'Task updated', data: { task } });
  } catch (err) { next(err); }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await taskService.deleteTask(req.params.id, req.user!.id, req.user!.role);
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};

export const getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await taskService.getTaskStats(req.user!.id, req.user!.role);
    res.status(200).json({ success: true, message: 'Task statistics', data: { stats } });
  } catch (err) { next(err); }
};
