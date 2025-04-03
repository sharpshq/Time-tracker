import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { Task } from '../types';

const TasksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks(projectId);
  const { projects } = useProjects();
  const { timeEntries, activeTimeEntry, startTimeTracking, stopTimeTracking } = useTimeEntries();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskTimeEntries, setTaskTimeEntries] = useState<Record<string, any[]>>({});

  useEffect(() => {
    // Group time entries by task
    const entriesByTask: Record<string, any[]> = {};
    timeEntries.forEach(entry => {
      if (!entriesByTask[entry.task_id]) {
        entriesByTask[entry.task_id] = [];
      }
      entriesByTask[entry.task_id].push(entry);
    });
    setTaskTimeEntries(entriesByTask);
  }, [timeEntries]);

  const handleCreateTask = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createTask(data);
      toast.success('Task created successfully');
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error('Failed to create task');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = async (data: any) => {
    if (!currentTask) return;
    
    setIsSubmitting(true);
    try {
      await updateTask(currentTask.id, data);
      toast.success('Task updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update task');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!currentTask) return;
    
    setIsSubmitting(true);
    try {
      await deleteTask(currentTask.id);
      toast.success('Task deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete task');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartTracking = async (taskId: string) => {
    try {
      await startTimeTracking(taskId);
      toast.success('Time tracking started');
    } catch (error) {
      toast.error('Failed to start time tracking');
      console.error(error);
    }
  };

  const handleStopTracking = async (taskId: string) => {
    if (!activeTimeEntry) return;
    
    try {
      await stopTimeTracking(activeTimeEntry.id);
      toast.success('Time tracking stopped');
    } catch (error) {
      toast.error('Failed to stop time tracking');
      console.error(error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      // If there's an active time entry for this task, stop it first
      if (activeTimeEntry && activeTimeEntry.task_id === taskId) {
        await stopTimeTracking(activeTimeEntry.id);
      }
      
      await updateTask(taskId, { status: 'completed' });
      toast.success('Task marked as completed');
    } catch (error) {
      toast.error('Failed to complete task');
      console.error(error);
    }
  };

  const openEditModal = (task: Task) => {
    setCurrentTask(task);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setCurrentTask(task);
      setIsDeleteModalOpen(true);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">
          {projectId 
            ? `Tasks for ${projects.find(p => p.id === projectId)?.name || 'Project'}`
            : 'All Tasks'
          }
        </h1>
      </div>

      <TaskList
        tasks={tasks}
        timeEntries={taskTimeEntries}
        activeTimeEntry={activeTimeEntry}
        onCreateTask={() => setIsCreateModalOpen(true)}
        onEditTask={openEditModal}
        onDeleteTask={openDeleteModal}
        onStartTracking={handleStartTracking}
        onStopTracking={handleStopTracking}
        onCompleteTask={handleCompleteTask}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          projects={projects}
          onSubmit={handleCreateTask}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
      >
        {currentTask && (
          <TaskForm
            task={currentTask}
            projects={projects}
            onSubmit={handleEditTask}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this task? This action cannot be undone and will also delete all time entries associated with this task.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleDeleteTask}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TasksPage;
