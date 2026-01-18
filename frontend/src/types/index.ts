export interface Organization {
    id: string;
    name: string;
    slug: string;
}


export interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    dueDate: string;
    organization: Organization;
    taskCount?: number;
    completionPercentage?: number;
}

export interface TaskComment {
    id: string;
    content: string;
    authorEmail: string;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    assigneeEmail: string;
    project: Project;
    comments?: TaskComment[];
}
