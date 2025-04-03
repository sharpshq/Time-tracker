import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ReportFilters from '../components/reports/ReportFilters';
import TimeTrackingChart from '../components/reports/TimeTrackingChart';
import TimeEntriesTable from '../components/reports/TimeEntriesTable';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { exportToCSV, exportToPDF, prepareChartData } from '../lib/utils';
import { TimeReport, ChartData } from '../types';

const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { timeEntries, getTimeEntriesByDateRange } = useTimeEntries();
  const [filteredEntries, setFilteredEntries] = useState(timeEntries);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportConfig, setReportConfig] = useState<TimeReport>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    groupBy: 'day',
  });

  // Initialize from URL params if available
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) {
      setReportConfig(prev => ({
        ...prev,
        projectId,
      }));
      handleGenerateReport({
        ...reportConfig,
        projectId,
      });
    }
  }, [searchParams]);

  const handleGenerateReport = async (filters: TimeReport) => {
    setIsGenerating(true);
    try {
      const entries = await getTimeEntriesByDateRange(filters.startDate, filters.endDate);
      
      let filtered = [...entries];
      
      // Filter by project if specified
      if (filters.projectId) {
        const projectTasks = tasks.filter(task => task.project_id === filters.projectId);
        const projectTaskIds = projectTasks.map(task => task.id);
        filtered = filtered.filter(entry => projectTaskIds.includes(entry.task_id));
      }
      
      // Filter by user if specified
      if (filters.userId) {
        filtered = filtered.filter(entry => entry.user_id === filters.userId);
      }
      
      setFilteredEntries(filtered);
      
      // Prepare chart data based on groupBy
      const data = prepareChartData(filtered, tasks, projects, filters.groupBy);
      setChartData(data);
      
      setReportConfig(filters);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    try {
      const data = filteredEntries.map(entry => {
        const task = tasks.find(t => t.id === entry.task_id);
        const project = task ? projects.find(p => p.id === task.project_id) : null;
        
        return {
          Date: new Date(entry.start_time).toLocaleDateString(),
          Project: project?.name || 'Unknown',
          Task: task?.title || 'Unknown',
          StartTime: new Date(entry.start_time).toLocaleTimeString(),
          EndTime: entry.end_time ? new Date(entry.end_time).toLocaleTimeString() : '-',
          Duration: entry.duration ? `${Math.floor(entry.duration / 3600)}h ${Math.floor((entry.duration % 3600) / 60)}m` : '-',
          Notes: entry.notes || '-',
        };
      });
      
      exportToCSV(data, 'Time Tracking Report');
      toast.success('Report exported to CSV');
    } catch (error) {
      toast.error('Failed to export report');
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    try {
      const data = filteredEntries.map(entry => {
        const task = tasks.find(t => t.id === entry.task_id);
        const project = task ? projects.find(p => p.id === task.project_id) : null;
        
        return {
          Date: new Date(entry.start_time).toLocaleDateString(),
          Project: project?.name || 'Unknown',
          Task: task?.title || 'Unknown',
          Duration: entry.duration ? `${Math.floor(entry.duration / 3600)}h ${Math.floor((entry.duration % 3600) / 60)}m` : '-',
        };
      });
      
      exportToPDF(data, 'Time Tracking Report');
      toast.success('Report exported to PDF');
    } catch (error) {
      toast.error('Failed to export report');
      console.error(error);
    }
  };

  // Create a map of tasks by ID for easier lookup
  const tasksMap = tasks.reduce((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {} as Record<string, typeof tasks[0]>);

  // Create a map of projects by ID for easier lookup
  const projectsMap = projects.reduce((acc, project) => {
    acc[project.id] = project;
    return acc;
  }, {} as Record<string, typeof projects[0]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ReportFilters
            projects={projects}
            users={[{ id: user?.id || '', email: user?.email || '', role: 'member' }]}
            onSubmit={handleGenerateReport}
            isSubmitting={isGenerating}
          />
        </div>
        
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {chartData.length > 0 && (
              <TimeTrackingChart
                data={chartData}
                type={reportConfig.groupBy === 'project' || reportConfig.groupBy === 'task' ? 'pie' : 'bar'}
                title={`Time by ${reportConfig.groupBy.charAt(0).toUpperCase() + reportConfig.groupBy.slice(1)}`}
              />
            )}
            
            <TimeEntriesTable
              timeEntries={filteredEntries}
              tasks={tasksMap}
              projects={projectsMap}
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
