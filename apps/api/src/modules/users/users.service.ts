import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map(this.mapToUser);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.mapToUser(user) : null;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.mapToUser(user) : null;
  }

  async create(data: {
    name: string;
    email: string;
    annualTargetTasks?: number;
    annualTargetScore?: number;
  }) {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        annualTargetTasks: data.annualTargetTasks || 0,
        annualTargetScore: data.annualTargetScore || 0,
      },
    });
    return this.mapToUser(user);
  }

  private mapToUser(prismaUser: any) {
    return {
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      annualTargetTasks: prismaUser.annualTargetTasks,
      annualTargetScore: prismaUser.annualTargetScore,
      createdAt: prismaUser.createdAt,
    };
  }
}
