import React, { useState, useEffect } from 'react';
import { Clock, Calendar, BarChart2, ListTodo, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useProjects } from '../hooks/useProjects';
import { formatDuration, isDeadlineApproaching, isDeadlinePassed } from '../lib/utils';
import TimeTrackingChart from '../components/reports/TimeTrackingChart';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { timeEntries, activeTimeEntry, loading: timeEntriesLoading } = useTimeEntries();
  const { projects, loading: projectsLoading } = useProjects();
  const [totalTimeToday, setTotalTimeToday] = useState(0);
  const [totalTimeThisWeek, setTotalTimeThisWeek] = useState(0);
  const [totalTimeThisMonth, setTotalTimeThisMonth] = useState(0);

  useEffect(() => {
    if (timeEntries.length === 0) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const todayEntries = timeEntries.filter(entry => new Date(entry.start_time) >= new Date(today));
    const weekEntries = timeEntries.filter(entry => new Date(entry.start_time) >= new Date(startOfWeek));
    const monthEntries = timeEntries.filter(entry => new Date(entry.start_time) >= new Date(startOfMonth));

    const calculateTotal = (entries: typeof timeEntries) => {
      return entries.reduce((total, entry) => {
        if (entry.duration) {
          return total + entry.duration;
        }
        if (entry.start_time && entry.end_time) {
          const start = new Date(entry.start_time).getTime();
          const end = new Date(entry.end_time).getTime();
          return total + (end - start) / 1000;
        }
        return total;
      }, 0);
    };

    setTotalTimeToday(calculateTotal(todayEntries));
    setTotalTimeThisWeek(calculateTotal(weekEntries));
    setTotalTimeThisMonth(calculateTotal(monthEntries));
  }, [timeEntries]);

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const upcomingDeadlines = tasks.filter(task => 
    task.status !== 'completed' && 
    task.deadline && 
    isDeadlineApproaching(task.deadline) && 
    !isDeadlinePassed(task.deadline)
  );
  const overdueTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    task.deadline && 
    isDeadlinePassed(task.deadline)
  );

  const projectTimeData = projects.map(project => {
    const projectTasks = tasks.filter(task => task.project_id === project.id);
    const projectTaskIds = projectTasks.map(task => task.id);
    const projectTimeEntries = timeEntries.filter(entry => projectTaskIds.includes(entry.task_id));
    
    const totalTime = projectTimeEntries.reduce((total, entry) => {
      if (entry.duration) {
        return total + entry.duration;
      }
      return total;
    }, 0);

    return {
      name: project.name,
      value: Math.round(totalTime / 3600), // Convert to hours
    };
  });

  const loading = tasksLoading || timeEntriesLoading || projectsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2">
          {activeTimeEntry && (
            <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <Clock className="h-4 w-4 mr-1 animate-pulse" />
              <span>Currently tracking: {tasks.find(t => t.id === activeTimeEntry.task_id)?.title}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Today</h3>
                <p className="text-2xl font-semibold text-gray-700">{formatDuration(totalTimeToday)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">This Week</h3>
                <p className="text-2xl font-semibold text-gray-700">{formatDuration(totalTimeThisWeek)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <BarChart2 className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">This Month</h3>
                <p className="text-2xl font-semibold text-gray-700">{formatDuration(totalTimeThisMonth)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeTrackingChart
          data={projectTimeData}
          type="pie"
          title="Time by Project"
        />

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Task Status</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Completed Tasks</span>
                </div>
                <span className="font-medium">{completedTasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 mr-2" />
                  <span>In Progress</span>
                </div>
                <span className="font-medium">{inProgressTasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>Upcoming Deadlines</span>
                </div>
                <span className="font-medium">{upcomingDeadlines.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <span>Overdue Tasks</span>
                </div>
                <span className="font-medium">{overdueTasks.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
            <Link to="/tasks">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tasks yet</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {tasks.slice(0, 5).map(task => (
                  <li key={task.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                        </p>
                      </div>
                      <div className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {task.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Time Entries</h3>
            <Link to="/reports">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {timeEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No time entries yet</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {timeEntries.slice(0, 5).map(entry => {
                  const task = tasks.find(t => t.id === entry.task_id);
                  return (
                    <li key={entry.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task?.title || 'Unknown Task'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.start_time).toLocaleDateString()} • 
                            {entry.duration ? formatDuration(entry.duration) : 'In progress'}
                          </p>
                        </div>
                        {!entry.end_time && (
                          <div className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Active
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
