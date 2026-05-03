import { Types } from 'mongoose';
import { Task } from '../models/task.model';
import { ApiError } from '../utils/apiError';
import { ITask, PaginationQuery, UserRole } from '../types';

interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: Date;
  tags?: string[];
  assignedTo?: string;
}

export const createTask = async (input: CreateTaskInput, ownerId: string): Promise<ITask> => {
  return Task.create({ ...input, owner: ownerId });
};

export const getTasks = async (
  userId: string,
  role: UserRole,
  query: PaginationQuery
) => {
  const { page = '1', limit = '10', sortBy = 'createdAt', order = 'desc', status, priority, search } = query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Admins see all tasks; users see only their own
  const filter: Record<string, unknown> = role === 'admin' ? {} : { owner: userId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.$text = { $search: search };

  const sortOrder = order === 'asc' ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum),
    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const getTaskById = async (taskId: string, userId: string, role: UserRole): Promise<ITask> => {
  if (!Types.ObjectId.isValid(taskId)) throw ApiError.badRequest('Invalid task ID');

  const task = await Task.findById(taskId)
    .populate('owner', 'name email')
    .populate('assignedTo', 'name email');

  if (!task) throw ApiError.notFound('Task not found');

  // Users can only view their own tasks
  if (role !== 'admin' && task.owner.toString() !== userId) {
    throw ApiError.forbidden();
  }

  return task;
};

export const updateTask = async (
  taskId: string,
  input: Partial<CreateTaskInput>,
  userId: string,
  role: UserRole
): Promise<ITask> => {
  if (!Types.ObjectId.isValid(taskId)) throw ApiError.badRequest('Invalid task ID');

  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound('Task not found');

  if (role !== 'admin' && task.owner.toString() !== userId) {
    throw ApiError.forbidden();
  }

  const updated = await Task.findByIdAndUpdate(taskId, { $set: input }, { new: true, runValidators: true })
    .populate('owner', 'name email')
    .populate('assignedTo', 'name email');

  return updated!;
};

export const deleteTask = async (taskId: string, userId: string, role: UserRole): Promise<void> => {
  if (!Types.ObjectId.isValid(taskId)) throw ApiError.badRequest('Invalid task ID');

  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound('Task not found');

  if (role !== 'admin' && task.owner.toString() !== userId) {
    throw ApiError.forbidden();
  }

  await task.deleteOne();
};

export const getTaskStats = async (userId: string, role: UserRole) => {
  const matchStage = role === 'admin' ? {} : { owner: new Types.ObjectId(userId) };

  const stats = await Task.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              { $and: [{ $lt: ['$dueDate', new Date()] }, { $ne: ['$status', 'done'] }] },
              1, 0
            ]
          }
        },
      },
    },
    { $project: { _id: 0 } },
  ]);

  return stats[0] || { total: 0, todo: 0, inProgress: 0, done: 0, highPriority: 0, overdue: 0 };
};
