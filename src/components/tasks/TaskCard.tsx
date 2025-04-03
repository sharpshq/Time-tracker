import React from 'react';
import { Clock, Calendar, Edit, Trash, Play, Pause, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import { Task, TimeEntry } from '../../types';
import { formatDate, getPriorityColor, getStatusColor, formatDuration, isDeadlineApproaching, isDeadlinePassed, getProgressPercentage } from '../../lib/utils';

interface TaskCardProps {
  task: Task;
  timeEntries: TimeEntry[];
  isTracking: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onComplete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  timeEntries,
  isTracking,
  onEdit,
  onDelete,
  onStartTracking,
  onStopTracking,
  onComplete,
}) => {
  const totalTimeSpent = timeEntries.reduce((total, entry) => {
    if (entry.duration) {
      return total + entry.duration;
    }
    return total;
  }, 0);

  const formattedTimeSpent = formatDuration(totalTimeSpent);
  const progress = getProgressPercentage(task, timeEntries);
  const isApproaching = isDeadlineApproaching(task.deadline);
  const isPassed = isDeadlinePassed(task.deadline);

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900 truncate">{task.title}</h3>
          <div className="flex space-x-1">
            <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'primary' : 'default'}>
              {task.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Badge>
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
        )}
        
        <div className="space-y-3">
          {task.deadline && (
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              <span className={`${isPassed ? 'text-red-600 font-medium' : isApproaching ? 'text-yellow-600' : 'text-gray-600'}`}>
                {formatDate(task.deadline)}
                {isPassed && ' (Overdue)'}
                {isApproaching && !isPassed && ' (Soon)'}
              </span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-gray-600">
              {formattedTimeSpent}
              {task.estimated_time && ` / ${Math.floor(task.estimated_time / 60)}h ${task.estimated_time % 60}m`}
            </span>
          </div>
          
          {task.estimated_time && (
            <ProgressBar
              value={progress}
              max={100}
              color={progress > 100 ? 'danger' : 'default'}
              size="sm"
            />
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between w-full">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              icon={<Edit className="h-4 w-4" />}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              icon={<Trash className="h-4 w-4" />}
            >
              Delete
            </Button>
          </div>
          
          <div className="flex space-x-2">
            {task.status !== 'completed' && (
              <>
                {isTracking ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={onStopTracking}
                    icon={<Pause className="h-4 w-4" />}
                  >
                    Stop
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={onStartTracking}
                    icon={<Play className="h-4 w-4" />}
                  >
                    Start
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="success"
                  onClick={onComplete}
                  icon={<CheckCircle className="h-4 w-4" />}
                >
                  Complete
                </Button>
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
