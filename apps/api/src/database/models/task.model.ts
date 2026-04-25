import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { User } from './user.model';
import { TimeLog } from './time-log.model';
import { Comment } from './comment.model';
import { TaskHistory } from './task-history.model';

@Table({
  tableName: 'tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Task extends Model {
  @PrimaryKey
  @Column({ type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, field: 'id' })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'user_id' })
  declare user_id: string;

  @Column({ type: DataTypes.STRING, allowNull: false, field: 'ticket_number' })
  declare ticket_number: string;

  @Column({ type: DataTypes.STRING, allowNull: false, field: 'description' })
  declare description: string;

  @Column({ type: DataTypes.STRING, allowNull: true, field: 'jira_link' })
  declare jira_link?: string;

  @Column({ type: DataTypes.ENUM({ values: ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'] }), defaultValue: 'MEDIUM', field: 'priority' })
  declare priority: string;

  @Column({ type: DataTypes.ENUM({ values: ['TODO', 'IN_PROGRESS', 'REVIEW', 'TESTING', 'READY_TO_LIVE', 'ON_HOLD', 'REOPEN', 'DONE'] }), defaultValue: 'TODO', field: 'status' })
  declare status: string;

  @Column({ type: DataTypes.DATE, allowNull: true, field: 'production_live_date' })
  declare production_live_date?: Date;

  @Column({ type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_locked' })
  declare is_locked: boolean;

  @Column({ type: DataTypes.DATE, allowNull: true, field: 'completed_at' })
  declare completed_at?: Date;

  declare created_at: Date;

  declare updated_at: Date;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => TimeLog)
  time_logs!: TimeLog[];

  @HasMany(() => Comment)
  comments!: Comment[];

  @HasMany(() => TaskHistory)
  history!: TaskHistory[];
}