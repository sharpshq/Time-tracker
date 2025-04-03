import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { Project } from '../../types';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  is_shared: z.boolean().default(false),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectFormValues) => void;
  isSubmitting: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: project || {
      is_shared: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Project Name"
        {...register('name')}
        error={errors.name?.message}
      />

      <Textarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_shared"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          {...register('is_shared')}
        />
        <label htmlFor="is_shared" className="ml-2 block text-sm text-gray-700">
          Share with team members
        </label>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
