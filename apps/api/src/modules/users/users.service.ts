import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../database/models';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async findAll() {
    const users = await this.userModel.findAll({
      order: [['created_at', 'DESC']],
    });
    return users.map(this.mapToUser);
  }

  async findOne(id: string) {
    const user = await this.userModel.findByPk(id);
    return user ? this.mapToUser(user) : null;
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ where: { email } });
    return user ? this.mapToUser(user) : null;
  }

  async create(data: {
    name: string;
    email: string;
    annualTargetTasks?: number;
    annualTargetScore?: number;
  }) {
    const user = await this.userModel.create({
      name: data.name,
      email: data.email,
      annual_target_tasks: data.annualTargetTasks || 0,
      annual_target_score: data.annualTargetScore || 0,
    });
    return this.mapToUser(user);
  }

  private mapToUser(user: User) {
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