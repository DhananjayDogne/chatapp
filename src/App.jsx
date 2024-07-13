import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './Component/Nav';
import Room from './Component/Room';
import LiveVideo from './Component/LiveVideo';
import Cursore from './model3d/Cursore';
import Home from './Component/Home';
import './App.css';

function App() {
  return (
    // bg-gradient-to-br from-white to-orange-100 via-red-100 to-yellow-100 text-white animate-gradient min-h-screen
    <div className='body  h-[100vh]'>
      <Cursore />
      <Router>
        <Nav />
        <Routes>
          {/* <Route path='/' element={<Home/>} /> */}
          <Route path="/" element={<Room />} />
          <Route path="/call" element={<LiveVideo />} />
      </Routes>
      </Router>
    </div>
  )
}

export default App
