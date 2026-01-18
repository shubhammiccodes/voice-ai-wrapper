import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/Header';
import { Input } from '../../components/ui/Input';
import type { Task, TaskComment } from '../../types';

const GET_PROJECT_DETAILS = gql`
  query GetProjectDetails($id: ID!) {
    projectById(id: $id) {
      id
      name
      description
      status
      tasks {
        id
        title
        description
        status
        assigneeEmail
        comments {
          id
          content
          authorEmail
          createdAt
        }
      }
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $projectId: ID!, $status: String) {
    createTask(title: $title, projectId: $projectId, status: $status) {
      task {
        id
        title
        status
      }
    }
  }
`;

const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($taskId: ID!, $status: String!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      task {
        id
        status
      }
    }
  }
`;


const UPDATE_TASK = gql`
  mutation UpdateTask($taskId: ID!, $title: String, $description: String, $status: String, $assigneeEmail: String) {
    updateTask(taskId: $taskId, title: $title, description: $description, status: $status, assigneeEmail: $assigneeEmail) {
      task {
        id
        title
        description
        status
        assigneeEmail
      }
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($taskId: ID!, $content: String!, $authorEmail: String!) {
    createComment(taskId: $taskId, content: $content, authorEmail: $authorEmail) {
        comment {
            id
            content
            authorEmail
            createdAt
        }
    }
  }
`;

// Actually, let's just update GET_PROJECT_DETAILS to get comments.

export const TaskBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { loading, error, data, refetch } = useQuery(GET_PROJECT_DETAILS, {
    variables: { id: projectId }
  });

  const [createTask] = useMutation(CREATE_TASK, { onCompleted: () => refetch() });
  const [updateStatus] = useMutation(UPDATE_TASK_STATUS);
  const [updateTask] = useMutation(UPDATE_TASK, { onCompleted: () => refetch() });
  const [createComment] = useMutation(CREATE_COMMENT, { onCompleted: () => refetch() });

  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Task Detail Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskAssignee, setEditTaskAssignee] = useState('');
  const [newComment, setNewComment] = useState('');

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description || '');
    setEditTaskAssignee(task.assigneeEmail || '');
    setNewComment('');
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    await updateTask({
      variables: {
        taskId: selectedTask.id,
        title: editTaskTitle,
        description: editTaskDesc,
        assigneeEmail: editTaskAssignee
      }
    });
    setSelectedTask(null);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;

    await createComment({
      variables: {
        taskId: selectedTask.id,
        content: newComment,
        authorEmail: "currentuser@example.com" // Hardcoded for now as I don't have auth context
      }
    });
    setNewComment('');
    // To update the modal's comment list, we rely on refetch which updates 'data'. 
    // We'll need to re-find the selected task from 'data' to see new comments if we want immediate feedback in modal, 
    // or we just rely on parent list update.
    // Better: Find the task in fresh data.
  };

  // Sync selectedTask with data updates for comments
  const currentSelectedTask = selectedTask && data?.projectById?.tasks
    ? data.projectById.tasks.find((t: Task) => t.id === selectedTask.id)
    : selectedTask;


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data?.projectById) return <p>Project not found</p>;

  const project = data.projectById;
  const tasks: Task[] = project.tasks;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask({
      variables: {
        title: newTaskTitle,
        projectId: projectId,
        status: 'TODO'
      }
    });
    setNewTaskTitle('');
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    await updateStatus({
      variables: { taskId, status: newStatus },
      optimisticResponse: {
        updateTaskStatus: {
          __typename: "UpdateTaskStatus",
          task: {
            __typename: "TaskType",
            id: taskId,
            status: newStatus
          }
        }
      }
    });
  };

  const columns = ['TODO', 'IN_PROGRESS', 'DONE'];

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        title={project.name}
        description={project.description}
      >
        <Link to="/" className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
      </Header>
      <div className="flex-1 flex flex-col w-full px-4 md:px-8 pb-4 overflow-y-auto md:overflow-hidden">

        <div className="mb-6 w-full max-w-md shrink-0">
          <form onSubmit={handleCreateTask} className="flex gap-2 items-start">
            <Input
              placeholder="New Task Title..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="h-10"
              wrapperClassName="mb-0 flex-1"
            />
            <Button type="submit" className="h-10 self-start text-nowrap">Add Task</Button>
          </form>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full flex-1 pb-4 min-h-0">
          {columns.map(status => (
            <div key={status} className="w-full md:flex-1 bg-slate-100/50 rounded-xl p-4 flex flex-col border border-slate-200 shrink-0 md:shrink">
              <h3 className="font-bold mb-4 text-slate-700 uppercase text-xs tracking-wider text-center">{status.replace('_', ' ')}</h3>
              <div className="flex-1 md:overflow-y-auto overflow-visible space-y-3 min-h-[100px] md:min-h-0">
                {tasks.filter(t => t.status === status).map(task => (
                  <Card
                    key={task.id}
                    className="p-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200 bg-white"
                    onClick={() => openTaskModal(task)}
                  >
                    <h4 className="font-semibold mb-1 text-slate-900 text-sm leading-snug">{task.title}</h4>
                    <div className="flex justify-between items-center mt-3 text-xs text-slate-400">
                      <span>#{task.id}</span>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        {status !== 'TODO' && (
                          <button onClick={() => moveTask(task.id, columns[columns.indexOf(status) - 1])} className="p-1 hover:bg-slate-200 rounded">&larr;</button>
                        )}
                        {status !== 'DONE' && (
                          <button onClick={() => moveTask(task.id, columns[columns.indexOf(status) + 1])} className="p-1 hover:bg-slate-200 rounded">&rarr;</button>
                        )}
                      </div>
                    </div>
                    {task.assigneeEmail && (
                      <div className="mt-2 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit">
                        {task.assigneeEmail}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Task Details Modal */}
        {currentSelectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTask(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Task Details</h2>
                <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600">
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <form onSubmit={handleUpdateTask} className="space-y-4">
                    <Input
                      label="Title"
                      value={editTaskTitle}
                      onChange={e => setEditTaskTitle(e.target.value)}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                      <textarea
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm shadow-sm focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all duration-200 resize-none h-32"
                        value={editTaskDesc}
                        onChange={e => setEditTaskDesc(e.target.value)}
                        placeholder="Add a description..."
                      />
                    </div>
                    <Input
                      label="Assignee Email"
                      value={editTaskAssignee}
                      onChange={e => setEditTaskAssignee(e.target.value)}
                      placeholder="user@example.com"
                    />
                    <Button type="submit" className="w-full justify-center">Update Task</Button>
                  </form>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-4">Comments</h3>
                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto bg-slate-50 p-4 rounded-lg">
                      {currentSelectedTask.comments && currentSelectedTask.comments.length > 0 ? (
                        currentSelectedTask.comments.map((comment: TaskComment) => (
                          <div key={comment.id} className="bg-white p-3 rounded shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-slate-600">{comment.authorEmail}</span>
                              <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-slate-800">{comment.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 text-center italic">No comments yet.</p>
                      )}
                    </div>
                    <form onSubmit={handleAddComment}>
                      <textarea
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm shadow-sm focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all duration-200 resize-none h-20 mb-2"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                      />
                      <Button type="submit" className="w-full justify-center" disabled={!newComment.trim()}>Post Comment</Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
