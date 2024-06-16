import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import Room from './Component/Room';
import LiveVideo from './Component/LiveVideo';

function App() {
  return (
    <div className=' bg-gradient-to-br from-white to-orange-100 via-red-100 to-yellow-100 text-white animate-gradient min-h-screen'>
    <Router>
      <Routes>
        <Route path="/" element={<Room />} />
        <Route path="/call" element={<LiveVideo />} />
      </Routes>
      </Router>
    </div>
  )
}

export default App
