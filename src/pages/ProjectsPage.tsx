import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import ProjectList from '../components/projects/ProjectList';
import ProjectForm from '../components/projects/ProjectForm';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { Project } from '../types';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const { tasks } = useTasks();
  const { timeEntries } = useTimeEntries();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateProject = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createProject(data);
      toast.success('Project created successfully');
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error('Failed to create project');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProject = async (data: any) => {
    if (!currentProject) return;
    
    setIsSubmitting(true);
    try {
      await updateProject(currentProject.id, data);
      toast.success('Project updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update project');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;
    
    setIsSubmitting(true);
    try {
      await deleteProject(currentProject.id);
      toast.success('Project deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete project');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (project: Project) => {
    setCurrentProject(project);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (project: Project) => {
    setCurrentProject(project);
    setIsDeleteModalOpen(true);
  };

  const handleViewProjectTasks = (projectId: string) => {
    navigate(`/projects/${projectId}/tasks`);
  };

  const handleViewProjectReports = (projectId: string) => {
    navigate(`/reports?projectId=${projectId}`);
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
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
      </div>

      <ProjectList
        projects={projects}
        tasks={tasks}
        timeEntries={timeEntries}
        onCreateProject={() => setIsCreateModalOpen(true)}
        onEditProject={openEditModal}
        onDeleteProject={openDeleteModal}
        onViewProjectTasks={handleViewProjectTasks}
        onViewProjectReports={handleViewProjectReports}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
      >
        {currentProject && (
          <ProjectForm
            project={currentProject}
            onSubmit={handleEditProject}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this project? This action cannot be undone and will also delete all tasks and time entries associated with this project.
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
              onClick={handleDeleteProject}
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

export default ProjectsPage;
