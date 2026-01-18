import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectDashboard } from './features/projects/ProjectDashboard'
import { TaskBoard } from './features/tasks/TaskBoard'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<ProjectDashboard />} />
          <Route path="/project/:projectId" element={<TaskBoard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
