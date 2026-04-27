import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority, TaskStatus } from '../../../database/models';

export { Priority, TaskStatus };

export class CreateTaskDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  user_id!: string;

  @ApiProperty({ example: 'TASK-001' })
  @IsString()
  ticket_number!: string;

  @ApiProperty({ example: 'Implement login feature' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: 'https://jira.example.com/browse/TASK-001' })
  @IsOptional()
  @IsString()
  jira_link?: string;

  @ApiProperty({ enum: Priority, example: Priority.HIGH })
  @IsEnum(Priority)
  priority!: Priority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  production_live_date?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ticket_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jira_link?: string;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  production_live_date?: string;
}

export class CreateTimeLogDto {
  @ApiProperty()
  @IsString()
  task_id!: string;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  hours!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  task_id!: string;

  @ApiProperty({ example: 'This task is blocked by another issue' })
  @IsString()
  comment!: string;
}
