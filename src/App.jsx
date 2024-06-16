import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import Room from './Component/Room';
import LiveVideo from './Component/LiveVideo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Room />} />
        <Route path="/call" element={<LiveVideo />} />
      </Routes>
    </Router>
  )
}

export default App
