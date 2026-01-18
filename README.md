# Voice AI Wrapper - Project Management System

## Overview
A multi-tenant project management tool built with Django (Backend) and React (Frontend).

## Prerequisites
- Python 3.8+
- Node.js 16+

## Setup Instructions

### Backend
1. Navigate to backend: `cd backend`
2. Create virtual env: `python -m venv venv`
3. Activate venv: `.\venv\Scripts\activate` (Windows)
4. Install reqs: `pip install -r requirements.txt` (Note: ensure django, graphene-django, django-cors-headers are installed)
5. Migrate: `python manage.py migrate`
6. Run: `python manage.py runserver`

### Frontend
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Run: `npm run dev`

## Features
- Organization-based Project isolation
- GraphQL API
- Task Board
