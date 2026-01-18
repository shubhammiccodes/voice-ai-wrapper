# Mini Project Management System

A multi-tenant project management system built with Django (Backend) and React (Frontend).

## Prerequisites
*   Python 3.8+
*   Node.js 16+
*   PostgreSQL (or SQLite for dev defaults)

## Setup Instructions

### Backend (Django)

1.  Navigate to `backend` directory:
    ```bash
    cd backend
    ```

2.  Create and activate virtual environment:
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\Activate
    # Mac/Linux
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install django djangorestframework graphene-django django-cors-headers
    # If requirements.txt exists: pip install -r requirements.txt
    ```

4.  Run migrations:
    ```bash
    python manage.py migrate
    ```

5.  Seed data (Optional):
    ```bash
    python manage.py seed_data
    ```

6.  Start server:
    ```bash
    python manage.py runserver
    ```
    API will be available at `http://localhost:8000/graphql/`

### Frontend (React)

1.  Navigate to `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start development server:
    ```bash
    npm run dev
    ```
    App will be available at `http://localhost:5173/`

## Features

*   **Multi-tenancy**: Select your Organization to view isolated projects.
*   **Project Management**: Create, View, Edit projects. View statistics.
*   **Task Management**: Kanban-style task board. Move tasks between statuses.
*   **Task Details**: Edit tasks, assign users, add comments.
*   **Optimistic UI**: Instant feedback when moving tasks.

## API Documentation

The API is GraphQL based. Browse the interactive schema at `http://localhost:8000/graphql/` (GraphiQL).

**Key Queries:**
*   `allOrganizations`: List organizations.
*   `allProjects(organizationSlug: String)`: List projects.
*   `projectById(id: ID)`: Get project details + tasks.

**Key Mutations:**
*   `createProject`, `updateProject`
*   `createTask`, `updateTask`, `updateTaskStatus`
*   `createComment`
