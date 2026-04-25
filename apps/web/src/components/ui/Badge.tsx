import { TaskStatus, Priority } from '../../types';

interface BadgeProps {
  variant: 'status' | 'priority';
  value: TaskStatus | Priority;
  className?: string;
}

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-700',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
  [TaskStatus.REVIEW]: 'bg-yellow-100 text-yellow-700',
  [TaskStatus.TESTING]: 'bg-purple-100 text-purple-700',
  [TaskStatus.READY_TO_LIVE]: 'bg-indigo-100 text-indigo-700',
  [TaskStatus.ON_HOLD]: 'bg-orange-100 text-orange-700',
  [TaskStatus.REOPEN]: 'bg-pink-100 text-pink-700',
  [TaskStatus.DONE]: 'bg-green-100 text-green-700',
};

const priorityColors: Record<Priority, string> = {
  [Priority.HIGHEST]: 'bg-red-100 text-red-700',
  [Priority.HIGH]: 'bg-orange-100 text-orange-700',
  [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-700',
  [Priority.LOW]: 'bg-blue-100 text-blue-700',
  [Priority.LOWEST]: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.REVIEW]: 'Review',
  [TaskStatus.TESTING]: 'Testing',
  [TaskStatus.READY_TO_LIVE]: 'Ready to Live',
  [TaskStatus.ON_HOLD]: 'On Hold',
  [TaskStatus.REOPEN]: 'Reopen',
  [TaskStatus.DONE]: 'Done',
};

const priorityLabels: Record<Priority, string> = {
  [Priority.HIGHEST]: 'Highest',
  [Priority.HIGH]: 'High',
  [Priority.MEDIUM]: 'Medium',
  [Priority.LOW]: 'Low',
  [Priority.LOWEST]: 'Lowest',
};

export function Badge({ variant, value, className = '' }: BadgeProps) {
  const colors =
    variant === 'status'
      ? statusColors[value as TaskStatus]
      : priorityColors[value as Priority];
  const label =
    variant === 'status'
      ? statusLabels[value as TaskStatus]
      : priorityLabels[value as Priority];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors} ${className}`}
    >
      {label}
    </span>
  );
}
