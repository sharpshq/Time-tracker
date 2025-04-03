import { format, differenceInSeconds, parseISO, addDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { TimeEntry, Task, Project } from '../types';

export const formatDate = (date: string | Date): string => {
  return format(typeof date === 'string' ? new Date(date) : date, 'MMM dd, yyyy');
};

export const formatTime = (date: string | Date): string => {
  return format(typeof date === 'string' ? new Date(date) : date, 'h:mm a');
};

export const formatDateTime = (date: string | Date): string => {
  return format(typeof date === 'string' ? new Date(date) : date, 'MMM dd, yyyy h:mm a');
};

export const calculateDuration = (startTime: string, endTime?: string): number => {
  if (!endTime) return 0;
  return differenceInSeconds(new Date(endTime), new Date(startTime));
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'not_started':
      return 'text-gray-600 bg-gray-100';
    case 'in_progress':
      return 'text-blue-600 bg-blue-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const exportToPDF = (data: any[], title: string): void => {
  const doc = new jsPDF();
  doc.text(title, 20, 10);
  
  // Add table headers
  const headers = Object.keys(data[0]);
  let yPos = 20;
  
  // Add table rows
  data.forEach((row, index) => {
    const values = Object.values(row);
    doc.text(values.join(', '), 20, yPos);
    yPos += 10;
  });
  
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
};

export const exportToCSV = (data: any[], title: string): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${title.toLowerCase().replace(/\s+/g, '_')}.xlsx`);
};

export const calculateTimeSpent = (timeEntries: TimeEntry[]): number => {
  return timeEntries.reduce((total, entry) => {
    if (entry.duration) {
      return total + entry.duration;
    }
    if (entry.start_time && entry.end_time) {
      return total + calculateDuration(entry.start_time, entry.end_time);
    }
    return total;
  }, 0);
};

export const isDeadlineApproaching = (deadline?: string): boolean => {
  if (!deadline) return false;
  const deadlineDate = parseISO(deadline);
  const threeDaysFromNow = addDays(new Date(), 3);
  return deadlineDate <= threeDaysFromNow && deadlineDate > new Date();
};

export const isDeadlinePassed = (deadline?: string): boolean => {
  if (!deadline) return false;
  return parseISO(deadline) < new Date();
};

export const getProgressPercentage = (task: Task, timeEntries: TimeEntry[]): number => {
  if (!task.estimated_time) return 0;
  const timeSpent = calculateTimeSpent(timeEntries);
  return Math.min(Math.round((timeSpent / (task.estimated_time * 60)) * 100), 100);
};

export const groupTimeEntriesByDay = (timeEntries: TimeEntry[]): Record<string, TimeEntry[]> => {
  return timeEntries.reduce((acc, entry) => {
    const day = format(new Date(entry.start_time), 'yyyy-MM-dd');
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(entry);
    return acc;
  }, {} as Record<string, TimeEntry[]>);
};

export const prepareChartData = (
  timeEntries: TimeEntry[],
  tasks: Task[],
  projects: Project[],
  groupBy: 'day' | 'week' | 'month' | 'project' | 'task'
) => {
  // Implementation depends on the specific chart library and requirements
  // This is a simplified version
  if (groupBy === 'project') {
    const projectMap = new Map<string, number>();
    
    timeEntries.forEach(entry => {
      const task = tasks.find(t => t.id === entry.task_id);
      if (task) {
        const projectId = task.project_id;
        const duration = entry.duration || calculateDuration(entry.start_time, entry.end_time);
        projectMap.set(projectId, (projectMap.get(projectId) || 0) + duration);
      }
    });
    
    return Array.from(projectMap.entries()).map(([projectId, duration]) => {
      const project = projects.find(p => p.id === projectId);
      return {
        name: project?.name || 'Unknown Project',
        value: Math.round(duration / 3600), // Convert to hours
      };
    });
  }
  
  // Similar implementations for other groupBy options
  return [];
};
