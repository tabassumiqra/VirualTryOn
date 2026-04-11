import { useLocation, Link, Navigate } from 'react-router-dom';
import { Download, Share2, RefreshCw } from 'lucide-react';

export default function Result() {
  const location = useLocation();
  const resultUrl = location.state?.resultUrl;

  if (!resultUrl) {
    return <Navigate to="/" />;
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `virtual-fit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading:', err);
    }
  };

  return (
    <div className="container result-section">
      <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Your New Look</h2>
      
      <div className="result-image-wrapper">
        <img src={resultUrl} alt="Virtual Try-On Result" className="result-image" />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button className="btn btn-primary" onClick={handleDownload}>
          <Download size={20} /> Download
        </button>
        <button className="btn btn-secondary">
          <Share2 size={20} /> Share
        </button>
        <Link to="/try-on" className="btn btn-secondary">
          <RefreshCw size={20} /> Try Another
        </Link>
      </div>
    </div>
  );
}
