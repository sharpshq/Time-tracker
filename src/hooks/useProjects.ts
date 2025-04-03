import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types';
import { useAuth } from './useAuth';

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .or(`user_id.eq.${user.id},is_shared.eq.true`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err : new Error('An error occurred while fetching projects'));
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

    // Subscribe to changes
    const projectsSubscription = supabase
      .channel('projects_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'projects',
        filter: `user_id=eq.${user.id}` 
      }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectsSubscription);
    };
  }, [user]);

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteProject = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    // First delete all tasks associated with the project
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('project_id', id);

    if (tasksError) throw tasksError;

    // Then delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const getProjectById = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
  };
};
