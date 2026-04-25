import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { Task } from './task.model';
import { User } from './user.model';

@Table({
  tableName: 'time_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class TimeLog extends Model {
  @PrimaryKey
  @Column({ type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, field: 'id' })
  declare id: string;

  @ForeignKey(() => Task)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'task_id' })
  declare task_id: string;

  @Column({ type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'hours' })
  declare hours: number;

  @Column({ type: DataTypes.STRING, allowNull: true, field: 'comment' })
  declare comment?: string;

  @ForeignKey(() => User)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'created_by' })
  declare created_by: string;

  declare created_at: Date;

  declare updated_at: Date;

  @BelongsTo(() => Task)
  task!: Task;

  @BelongsTo(() => User)
  user!: User;
}