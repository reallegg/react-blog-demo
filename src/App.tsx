import { Routes, Route } from 'react-router'
import PullToRefresh from './pages/PullToRefresh/index.tsx'
import PracticeHub from './pages/PracticeHub/index.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PullToRefresh />} />
      <Route path="/practice" element={<PracticeHub />} />
    </Routes>
  )
}

export default App
