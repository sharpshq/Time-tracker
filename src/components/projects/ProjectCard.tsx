import React from 'react';
import { Users, Clock, ListTodo, BarChart2, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { Project, Task, TimeEntry } from '../../types';
import { formatDate, calculateTimeSpent, formatDuration } from '../../lib/utils';

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  timeEntries: TimeEntry[];
  onEdit: () => void;
  onDelete: () => void;
  onViewTasks: () => void;
  onViewReports: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  tasks,
  timeEntries,
  onEdit,
  onDelete,
  onViewTasks,
  onViewReports,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTimeSpent = calculateTimeSpent(timeEntries);

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
          {project.is_shared && (
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span>Shared</span>
            </div>
          )}
        </div>
        
        {project.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-gray-600">
              Total time: {formatDuration(totalTimeSpent)}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <ListTodo className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-gray-600">
              Tasks: {completedTasks}/{totalTasks} completed
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <BarChart2 className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-gray-600">
              Created: {formatDate(project.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-2 w-full">
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
          <Button
            size="sm"
            variant="primary"
            onClick={onViewTasks}
            icon={<ListTodo className="h-4 w-4" />}
          >
            Tasks
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onViewReports}
            icon={<BarChart2 className="h-4 w-4" />}
          >
            Reports
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
