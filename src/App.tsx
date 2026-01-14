import { Routes, Route } from 'react-router'
import PullToRefresh from './pages/PullToRefresh/index.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PullToRefresh />} />
    </Routes>
  )
}

export default App
