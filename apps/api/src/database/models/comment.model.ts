import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { Task } from './task.model';
import { User } from './user.model';

@Table({
  tableName: 'comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Comment extends Model {
  @PrimaryKey
  @Column({ type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, field: 'id' })
  declare id: string;

  @ForeignKey(() => Task)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'task_id' })
  declare task_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'user_id' })
  declare user_id: string;

  @Column({ type: DataTypes.STRING, allowNull: false, field: 'comment' })
  declare comment: string;

  declare created_at: Date;

  declare updated_at: Date;

  @BelongsTo(() => Task)
  task!: Task;

  @BelongsTo(() => User)
  user!: User;
}