import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import ProjectCard from './ProjectCard';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Project, Task, TimeEntry } from '../../types';

interface ProjectListProps {
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onViewProjectTasks: (projectId: string) => void;
  onViewProjectReports: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  tasks,
  timeEntries,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onViewProjectTasks,
  onViewProjectReports,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.project_id === projectId);
  };

  const getProjectTimeEntries = (projectId: string) => {
    const projectTaskIds = getProjectTasks(projectId).map(task => task.id);
    return timeEntries.filter(entry => projectTaskIds.includes(entry.task_id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-gray-400" />}
            className="w-full sm:w-64"
          />
        </div>
        
        <Button
          variant="primary"
          onClick={onCreateProject}
          icon={<Plus className="h-4 w-4" />}
        >
          New Project
        </Button>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Filter className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new project.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={onCreateProject}
              icon={<Plus className="h-4 w-4" />}
            >
              Create New Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={getProjectTasks(project.id)}
              timeEntries={getProjectTimeEntries(project.id)}
              onEdit={() => onEditProject(project)}
              onDelete={() => onDeleteProject(project.id)}
              onViewTasks={() => onViewProjectTasks(project.id)}
              onViewReports={() => onViewProjectReports(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
