import React from 'react';
import { Clock, Calendar, FileText } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { TimeEntry, Task, Project } from '../../types';
import { formatDate, formatTime, formatDuration, calculateDuration } from '../../lib/utils';

interface TimeEntriesTableProps {
  timeEntries: TimeEntry[];
  tasks: Record<string, Task>;
  projects: Record<string, Project>;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

const TimeEntriesTable: React.FC<TimeEntriesTableProps> = ({
  timeEntries,
  tasks,
  projects,
  onExportCSV,
  onExportPDF,
}) => {
  const totalDuration = timeEntries.reduce((total, entry) => {
    if (entry.duration) {
      return total + entry.duration;
    }
    if (entry.start_time && entry.end_time) {
      return total + calculateDuration(entry.start_time, entry.end_time);
    }
    return total;
  }, 0);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Time Entries</h3>
          <p className="text-sm text-gray-500">
            {timeEntries.length} entries, total time: {formatDuration(totalDuration)}
          </p>
        </div>
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <Button
            size="sm"
            variant="outline"
            onClick={onExportCSV}
            icon={<FileText className="h-4 w-4" />}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onExportPDF}
            icon={<FileText className="h-4 w-4" />}
          >
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No time entries found
                  </td>
                </tr>
              ) : (
                timeEntries.map((entry) => {
                  const task = tasks[entry.task_id];
                  const project = task ? projects[task.project_id] : null;
                  const duration = entry.duration || (entry.start_time && entry.end_time ? calculateDuration(entry.start_time, entry.end_time) : 0);
                  
                  return (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(entry.start_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project?.name || 'Unknown Project'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task?.title || 'Unknown Task'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(entry.start_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.end_time ? formatTime(entry.end_time) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(duration)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {entry.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeEntriesTable;
