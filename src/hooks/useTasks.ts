import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Task } from '../types';
import { useAuth } from './useAuth';

export const useTasks = (projectId?: string) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setTasks(data || []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err instanceof Error ? err : new Error('An error occurred while fetching tasks'));
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    // Subscribe to changes
    const tasksSubscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks',
        filter: `user_id=eq.${user.id}` 
      }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, [user, projectId]);

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteTask = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    // First delete all time entries associated with the task
    const { error: timeEntriesError } = await supabase
      .from('time_entries')
      .delete()
      .eq('task_id', id);

    if (timeEntriesError) throw timeEntriesError;

    // Then delete the task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const getTaskById = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
  };
};
