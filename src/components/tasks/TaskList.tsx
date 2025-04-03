import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Task, TimeEntry } from '../../types';

interface TaskListProps {
  tasks: Task[];
  timeEntries: Record<string, TimeEntry[]>;
  activeTimeEntry: TimeEntry | null;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStartTracking: (taskId: string) => void;
  onStopTracking: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  timeEntries,
  activeTimeEntry,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onStartTracking,
  onStopTracking,
  onCompleteTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'title':
        return a.title.localeCompare(b.title);
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-gray-400" />}
            className="w-full sm:w-64"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Select
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'not_started', label: 'Not Started' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full sm:w-auto"
          />
          
          <Select
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
            value={priorityFilter}
            onChange={setPriorityFilter}
            className="w-full sm:w-auto"
          />
          
          <Select
            options={[
              { value: 'deadline', label: 'Sort by Deadline' },
              { value: 'priority', label: 'Sort by Priority' },
              { value: 'title', label: 'Sort by Title' },
              { value: 'created', label: 'Sort by Created' },
            ]}
            value={sortBy}
            onChange={setSortBy}
            className="w-full sm:w-auto"
          />
          
          <Button
            variant="primary"
            onClick={onCreateTask}
            icon={<Plus className="h-4 w-4" />}
          >
            New Task
          </Button>
        </div>
      </div>
      
      {sortedTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Filter className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={onCreateTask}
              icon={<Plus className="h-4 w-4" />}
            >
              Create New Task
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              timeEntries={timeEntries[task.id] || []}
              isTracking={activeTimeEntry?.task_id === task.id}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
              onStartTracking={() => onStartTracking(task.id)}
              onStopTracking={() => onStopTracking(task.id)}
              onComplete={() => onCompleteTask(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
