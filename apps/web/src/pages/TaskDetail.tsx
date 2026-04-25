import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../api/client';
import { Task, TaskStatus } from '../types';
import { ArrowLeft, Clock, MessageSquare, Lock } from 'lucide-react';

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLogHours, setTimeLogHours] = useState('');
  const [timeLogComment, setTimeLogComment] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      try {
        const data = await api.tasks.getOne(id);
        setTask(data);
      } catch (error) {
        console.error('Failed to fetch task:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    try {
      const updated = await api.tasks.updateStatus(task.id, newStatus, task.status);
      setTask(updated);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Check if the transition is allowed.');
    }
  };

  const handleAddTimeLog = async () => {
    if (!task || !timeLogHours) return;
    try {
      await api.tasks.addTimeLog(
        task.id,
        { task_id: task.id, hours: parseFloat(timeLogHours), comment: timeLogComment },
        task.user_id,
      );
      setTimeLogHours('');
      setTimeLogComment('');
      alert('Time log added successfully');
    } catch (error) {
      console.error('Failed to add time log:', error);
    }
  };

  const handleAddComment = async () => {
    if (!task || !newComment) return;
    try {
      await api.tasks.addComment(
        task.id,
        { task_id: task.id, comment: newComment },
        task.user_id,
      );
      setNewComment('');
      alert('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
        <Button onClick={() => navigate('/tasks')} className="mt-4">
          Back to Tasks
        </Button>
      </div>
    );
  }

  const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW, TaskStatus.ON_HOLD],
    [TaskStatus.REVIEW]: [TaskStatus.TESTING, TaskStatus.REOPEN, TaskStatus.ON_HOLD],
    [TaskStatus.TESTING]: [TaskStatus.READY_TO_LIVE, TaskStatus.REOPEN, TaskStatus.ON_HOLD],
    [TaskStatus.READY_TO_LIVE]: [TaskStatus.DONE, TaskStatus.REOPEN],
    [TaskStatus.ON_HOLD]: [],
    [TaskStatus.REOPEN]: [TaskStatus.IN_PROGRESS],
    [TaskStatus.DONE]: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/tasks')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {task.is_locked && (
          <span className="flex items-center text-gray-500 text-sm">
            <Lock className="w-4 h-4 mr-1" />
            Locked
          </span>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{task.ticket_number}</h1>
            <p className="text-gray-500 text-sm mt-1">{task.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="priority" value={task.priority} />
            <Badge variant="status" value={task.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Jira Link:</span>
              <span className="ml-2">{task.jira_link || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Production Live Date:</span>
              <span className="ml-2">
                {task.production_live_date
                  ? new Date(task.production_live_date).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <span className="ml-2">{new Date(task.created_at).toLocaleDateString()}</span>
            </div>
            {task.completed_at && (
              <div>
                <span className="text-gray-500">Completed:</span>
                <span className="ml-2">{new Date(task.completed_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!task.is_locked && (
        <Card>
          <CardHeader>Update Status</CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allowedTransitions[task.status]?.map((status) => (
                <Button
                  key={status}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStatusChange(status)}
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Time Log
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Hours"
              value={timeLogHours}
              onChange={(e) => setTimeLogHours(e.target.value)}
              className="w-24 px-3 py-2 border rounded-md"
              step="0.5"
              min="0"
            />
            <input
              type="text"
              placeholder="Comment (optional)"
              value={timeLogComment}
              onChange={(e) => setTimeLogComment(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button onClick={handleAddTimeLog}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Comments
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button onClick={handleAddComment}>Add</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
