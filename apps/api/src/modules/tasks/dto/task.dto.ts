import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Priority {
  HIGHEST = 'HIGHEST',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  LOWEST = 'LOWEST',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  TESTING = 'TESTING',
  READY_TO_LIVE = 'READY_TO_LIVE',
  ON_HOLD = 'ON_HOLD',
  REOPEN = 'REOPEN',
  DONE = 'DONE',
}

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'TASK-001' })
  @IsString()
  ticketNumber!: string;

  @ApiProperty({ example: 'Implement login feature' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: 'https://jira.example.com/browse/TASK-001' })
  @IsOptional()
  @IsString()
  jiraLink?: string;

  @ApiProperty({ enum: Priority, example: Priority.HIGH })
  @IsEnum(Priority)
  priority!: Priority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productionLiveDate?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ticketNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jiraLink?: string;

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
  productionLiveDate?: string;
}

export class CreateTimeLogDto {
  @ApiProperty()
  @IsString()
  taskId!: string;

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
  taskId!: string;

  @ApiProperty({ example: 'This task is blocked by another issue' })
  @IsString()
  comment!: string;
}
