import { Link } from 'react-router-dom';
import { Sparkles, Camera } from 'lucide-react';

export default function Home() {
  return (
    <div className="container hero-section">
      <h1 className="hero-title">Experience Fashion<br/>Before You Buy</h1>
      <p className="hero-subtitle">
        Upload your photo and a clothing item to see how it looks on you instantly, powered by advanced AI.
      </p>
      <div className="hero-actions">
        <Link to="/try-on" className="btn btn-primary">
          <Sparkles size={20} /> Try It Now
        </Link>
        <button className="btn btn-secondary">
          <Camera size={20} /> View Gallery
        </button>
      </div>
    </div>
  );
}
