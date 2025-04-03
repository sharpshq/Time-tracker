import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Task, Project } from '../../types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  project_id: z.string().min(1, 'Project is required'),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  deadline: z.string().optional(),
  estimated_time: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  projects: Project[];
  onSubmit: (data: TaskFormValues) => void;
  isSubmitting: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  projects,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          ...task,
          deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : undefined,
          estimated_time: task.estimated_time?.toString(),
        }
      : {
          priority: 'medium',
          status: 'not_started',
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Task Title"
        {...register('title')}
        error={errors.title?.message}
      />

      <Textarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
      />

      <Select
        label="Project"
        options={projects.map(project => ({
          value: project.id,
          label: project.name,
        }))}
        {...register('project_id')}
        error={errors.project_id?.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Priority"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          {...register('priority')}
          error={errors.priority?.message}
        />

        <Select
          label="Status"
          options={[
            { value: 'not_started', label: 'Not Started' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ]}
          {...register('status')}
          error={errors.status?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Deadline"
          type="date"
          {...register('deadline')}
          error={errors.deadline?.message}
        />

        <Input
          label="Estimated Time (minutes)"
          type="number"
          min="0"
          {...register('estimated_time')}
          error={errors.estimated_time?.message}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
