import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TimeEntry } from '../types';
import { useAuth } from './useAuth';

export const useTimeEntries = (taskId?: string) => {
  const { user } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchTimeEntries = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false });

        if (taskId) {
          query = query.eq('task_id', taskId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setTimeEntries(data || []);

        // Check for active time entry (no end_time)
        const active = data?.find(entry => !entry.end_time);
        setActiveTimeEntry(active || null);
      } catch (err) {
        console.error('Error fetching time entries:', err);
        setError(err instanceof Error ? err : new Error('An error occurred while fetching time entries'));
      } finally {
        setLoading(false);
      }
    };

    fetchTimeEntries();

    // Subscribe to changes
    const timeEntriesSubscription = supabase
      .channel('time_entries_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'time_entries',
        filter: `user_id=eq.${user.id}` 
      }, () => {
        fetchTimeEntries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(timeEntriesSubscription);
    };
  }, [user, taskId]);

  const startTimeTracking = async (taskId: string, notes?: string) => {
    if (!user) throw new Error('User not authenticated');

    // Check if there's already an active time entry
    if (activeTimeEntry) {
      await stopTimeTracking(activeTimeEntry.id);
    }

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        task_id: taskId,
        user_id: user.id,
        start_time: new Date().toISOString(),
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const stopTimeTracking = async (timeEntryId: string) => {
    if (!user) throw new Error('User not authenticated');

    const endTime = new Date().toISOString();
    
    // Get the time entry to calculate duration
    const { data: timeEntry, error: fetchError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', timeEntryId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Calculate duration in seconds
    const startTime = new Date(timeEntry.start_time);
    const duration = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / 1000);
    
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        end_time: endTime,
        duration,
      })
      .eq('id', timeEntryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateTimeEntry = async (id: string, timeEntryData: Partial<TimeEntry>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('time_entries')
      .update(timeEntryData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteTimeEntry = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const getTimeEntriesByDateRange = async (startDate: string, endDate: string) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  };

  return {
    timeEntries,
    activeTimeEntry,
    loading,
    error,
    startTimeTracking,
    stopTimeTracking,
    updateTimeEntry,
    deleteTimeEntry,
    getTimeEntriesByDateRange,
  };
};
