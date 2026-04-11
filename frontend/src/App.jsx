import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Result from './pages/Result';

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          Virtual<span>Fit</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/try-on" className="nav-link">Try On</Link>
        </div>
      </nav>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/try-on" element={<Upload />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
