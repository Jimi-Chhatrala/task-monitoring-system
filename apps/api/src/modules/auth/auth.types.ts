import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  annual_target_tasks: number;
  annual_target_score: number;
  created_at: Date;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
