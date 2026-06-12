import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import HowItWorks from './pages/HowItWorks';
import Demo from './pages/Demo';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/demo" element={<Demo />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
