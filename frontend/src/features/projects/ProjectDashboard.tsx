import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/Header';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { Organization, Project } from '../../types';

const GET_DATA = gql`
  query GetData {
    allOrganizations {
      id
      name
      slug
    }
    allProjects {
      id
      name
      description
      status
      taskCount
      completionPercentage
      organization {
        id
        name
      }
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $organizationId: ID!, $description: String) {
    createProject(name: $name, organizationId: $organizationId, description: $description) {
      project {
        id
        name
        description
        status
        taskCount
        completionPercentage
        organization {
          id
          name
        }
      }
    }
  }
`;

export
    const UPDATE_PROJECT = gql`
  mutation UpdateProject($projectId: ID!, $name: String, $description: String, $status: String) {
    updateProject(projectId: $projectId, name: $name, description: $description, status: $status) {
      project {
        id
        name
        description
        status
      }
    }
  }
`;

export const ProjectDashboard: React.FC = () => {
    const { loading, error, data, refetch } = useQuery(GET_DATA);
    const [createProject] = useMutation(CREATE_PROJECT, {
        onCompleted: () => refetch()
    });
    const [updateProject] = useMutation(UPDATE_PROJECT, {
        onCompleted: () => {
            refetch();
            setEditingProject(null);
        }
    });

    const [newProjectName, setNewProjectName] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState<string>('');
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [filterOrgId, setFilterOrgId] = useState<string>('');

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editStatus, setEditStatus] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Pagination Logic
    const projectsList = data?.allProjects || [];
    const filteredProjects = filterOrgId
        ? projectsList.filter((p: Project) => p.organization.id === filterOrgId)
        : projectsList;
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const openEdit = (project: Project, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        setEditingProject(project);
        setEditName(project.name);
        setEditDesc(project.description);
        setEditStatus(project.status);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProject) return;

        await updateProject({
            variables: {
                projectId: editingProject.id,
                name: editName,
                description: editDesc,
                status: editStatus
            }
        });
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

    const organizations: Organization[] = data.allOrganizations;
    const projects: Project[] = data.allProjects;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrgId) return alert("Select an organization");

        await createProject({
            variables: {
                name: newProjectName,
                organizationId: selectedOrgId,
                description: "Created from frontend"
            }
        });
        setNewProjectName('');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-8">
            <Header />
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar / Create Form */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-8">
                            <h2 className="text-lg font-semibold mb-4 text-slate-800">New Project</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization</label>
                                    <select
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm shadow-sm
                                        focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all duration-200"
                                        value={selectedOrgId}
                                        onChange={e => setSelectedOrgId(e.target.value)}
                                    >
                                        <option value="">Select Organization</option>
                                        {organizations.map(org => (
                                            <option key={org.id} value={org.id}>{org.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    label="Project Name"
                                    value={newProjectName}
                                    onChange={e => setNewProjectName(e.target.value)}
                                    placeholder="e.g. Website Redesign"
                                    required
                                />
                                <Button type="submit" className="w-full justify-center">Create Project</Button>
                            </form>
                        </Card>
                    </div>

                    {/* Project List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="font-semibold text-slate-800">Projects</h2>
                            <select
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={filterOrgId}
                                onChange={e => {
                                    setFilterOrgId(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">All Organizations</option>
                                {organizations.map(org => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paginatedProjects.map((project: Project) => (
                                <Link key={project.id} to={`/project/${project.id}`} className="block h-full group relative">
                                    <Card className="h-full hover:border-blue-200 transition-colors duration-200 pb-12">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors text-ellipsis overflow-hidden line-clamp-1 pr-2">
                                                {project.name}
                                            </h3>
                                            <span className={`shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full ${project.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                : project.status === 'COMPLETED'
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                            {project.description || "No description provided."}
                                        </p>

                                        <div className="mt-2 flex gap-4 text-xs text-slate-400">
                                            <span>Tasks: {project.taskCount || 0}</span>
                                            <span>Progress: {Math.round(project.completionPercentage || 0)}%</span>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs text-slate-400 font-medium pt-4 border-t border-slate-50">
                                            <span className="uppercase tracking-wider truncate max-w-[120px]">{project.organization.name}</span>
                                            <button
                                                onClick={(e) => openEdit(project, e)}
                                                className="text-blue-600 hover:text-blue-800 hover:underline z-10"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                        {projects.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-500">No projects found. Create one to get started.</p>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {projects.length > 0 && (
                            <div className="flex justify-center items-center space-x-4 mt-8 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-md border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-slate-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-slate-500 font-medium">
                                    Page <span className="text-slate-900 font-bold">{currentPage}</span> of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-md border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-slate-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Modal */}
                {editingProject && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <Input
                                    label="Name"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                    <textarea
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm shadow-sm focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all duration-200 resize-none h-24"
                                        value={editDesc}
                                        onChange={e => setEditDesc(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                                    <select
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm shadow-sm focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all duration-200"
                                        value={editStatus}
                                        onChange={e => setEditStatus(e.target.value)}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="ON_HOLD">On Hold</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="secondary" onClick={() => setEditingProject(null)}>Cancel</Button>
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
