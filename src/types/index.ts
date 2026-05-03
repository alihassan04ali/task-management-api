import { Request } from 'express';
import { Document, Types } from 'mongoose';

export type UserRole = 'admin' | 'user';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  tags: string[];
  owner: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export interface TokenPayload {
  id: string;
  role: UserRole;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
