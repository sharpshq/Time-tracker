export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'member';
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  user_id: string;
  is_shared: boolean;
  team_members?: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  estimated_time?: number; // in minutes
  created_at: string;
}

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration?: number; // in seconds
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'deadline' | 'threshold' | 'mention' | 'system';
  read: boolean;
  related_id?: string; // task_id or project_id
  created_at: string;
}

export interface TimeReport {
  startDate: string;
  endDate: string;
  projectId?: string;
  userId?: string;
  groupBy: 'day' | 'week' | 'month' | 'project' | 'task';
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}
