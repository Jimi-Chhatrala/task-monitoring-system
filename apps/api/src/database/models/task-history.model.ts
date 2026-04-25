import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { Task } from './task.model';

@Table({
  tableName: 'task_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class TaskHistory extends Model {
  @PrimaryKey
  @Column({ type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, field: 'id' })
  declare id: string;

  @ForeignKey(() => Task)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'task_id' })
  declare task_id: string;

  @Column({ type: DataTypes.STRING, allowNull: false, field: 'field' })
  declare field: string;

  @Column({ type: DataTypes.STRING, allowNull: true, field: 'old_value' })
  declare old_value?: string;

  @Column({ type: DataTypes.STRING, allowNull: true, field: 'new_value' })
  declare new_value?: string;

  @Column({ type: DataTypes.STRING, allowNull: false, field: 'changed_by' })
  declare changed_by: string;

  declare created_at: Date;

  declare updated_at: Date;

  @BelongsTo(() => Task)
  task!: Task;
}