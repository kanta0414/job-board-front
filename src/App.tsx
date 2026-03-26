import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import JobListPage from './pages/JobListPage'
import PostJobPage from './pages/PostJobPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JobListPage />} />
        <Route path="/post" element={<PostJobPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
