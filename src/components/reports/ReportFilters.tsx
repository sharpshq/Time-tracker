import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Project, User } from '../../types';

const reportSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  projectId: z.string().optional(),
  userId: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'project', 'task']),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportFiltersProps {
  projects: Project[];
  users: User[];
  onSubmit: (data: ReportFormValues) => void;
  isSubmitting: boolean;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  projects,
  users,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      groupBy: 'day',
    },
  });

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">Report Filters</h3>
      </CardHeader>
      <CardContent>
        <form id="report-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
            <Input
              label="End Date"
              type="date"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Project"
              options={[
                { value: '', label: 'All Projects' },
                ...projects.map(project => ({
                  value: project.id,
                  label: project.name,
                })),
              ]}
              {...register('projectId')}
              error={errors.projectId?.message}
            />
            <Select
              label="User"
              options={[
                { value: '', label: 'All Users' },
                ...users.map(user => ({
                  value: user.id,
                  label: user.full_name || user.email,
                })),
              ]}
              {...register('userId')}
              error={errors.userId?.message}
            />
          </div>

          <Select
            label="Group By"
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'project', label: 'Project' },
              { value: 'task', label: 'Task' },
            ]}
            {...register('groupBy')}
            error={errors.groupBy?.message}
          />
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="report-form"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Generate Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportFilters;
