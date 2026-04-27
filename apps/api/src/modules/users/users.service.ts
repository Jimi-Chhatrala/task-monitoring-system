import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../database/models';
import { hashPassword } from '../auth/password.util';
import { AuthenticatedUser } from '../auth/auth.types';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async findAll() {
    const users = await this.userModel.findAll({
      order: [['created_at', 'DESC']],
    });
    return users.map((user) => this.toPublicUser(user));
  }

  async findOne(id: string) {
    const user = await this.userModel.findByPk(id);
    return user ? this.toPublicUser(user) : null;
  }

  async findModelById(id: string) {
    return this.userModel.findByPk(id);
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ where: { email } });
    return user ? this.toPublicUser(user) : null;
  }

  async findModelByEmail(email: string) {
    return this.userModel.findOne({ where: { email } });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    annualTargetTasks?: number;
    annualTargetScore?: number;
  }) {
    const user = await this.userModel.create({
      name: data.name,
      email: data.email,
      password_hash: hashPassword(data.password),
      annual_target_tasks: data.annualTargetTasks || 0,
      annual_target_score: data.annualTargetScore || 0,
    });
    return this.toPublicUser(user);
  }

  toPublicUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      annual_target_tasks: user.annual_target_tasks,
      annual_target_score: user.annual_target_score,
      created_at: user.created_at,
    };
  }
}
