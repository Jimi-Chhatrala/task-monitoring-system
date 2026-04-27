import { Table, Column, Model, HasMany } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { Task } from './task.model';
import { Comment } from './comment.model';
import { TimeLog } from './time-log.model';

@Table({
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class User extends Model {
  @Column({ type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataTypes.STRING, allowNull: false, field: 'name' })
  declare name: string;

  @Column({ type: DataTypes.STRING, allowNull: false, unique: true, field: 'email' })
  declare email: string;

  @Column({ type: DataTypes.TEXT, allowNull: true, field: 'password_hash' })
  declare password_hash?: string;

  @Column({ type: DataTypes.INTEGER, defaultValue: 0, field: 'annual_target_tasks' })
  declare annual_target_tasks: number;

  @Column({ type: DataTypes.INTEGER, defaultValue: 0, field: 'annual_target_score' })
  declare annual_target_score: number;

  declare created_at: Date;

  declare updated_at: Date;

  @HasMany(() => Task)
  tasks!: Task[];

  @HasMany(() => Comment)
  comments!: Comment[];

  @HasMany(() => TimeLog)
  time_logs!: TimeLog[];
}
