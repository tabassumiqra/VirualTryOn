import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Upload as UploadIcon, Camera, Image as ImageIcon, Send } from 'lucide-react';

export default function UploadPage() {
  const [userImage, setUserImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [userPreview, setUserPreview] = useState(null);
  const [clothPreview, setClothPreview] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const handleUserImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserImage(file);
      setUserPreview(URL.createObjectURL(file));
      setUseWebcam(false);
    }
  };

  const handleClothImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setClothImage(file);
      setClothPreview(URL.createObjectURL(file));
    }
  };

  const captureWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Convert base64 to file
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "webcam_capture.jpg", { type: "image/jpeg" });
          setUserImage(file);
          setUserPreview(imageSrc);
          setUseWebcam(false);
        });
    }
  };

  const handleSubmit = async () => {
    if (!userImage || !clothImage) {
      setError("Please provide both your photo and a clothing item.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('userImage', userImage);
    formData.append('clothImage', clothImage);
    formData.append('garmentDescription', 'Clothing item');

    try {
      const response = await axios.post('http://localhost:5000/api/try-on', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        navigate('/result', { state: { resultUrl: `http://localhost:5000${response.data.resultImageUrl}` } });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error processing virtual try-on");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container loader-wrapper">
        <div className="spinner"></div>
        <h2>Processing your new look...</h2>
        <p style={{ color: "var(--text-secondary)" }}>Our AI is perfectly fitting the outfit to your body.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Upload Photos</h2>
      {error && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
      
      <div className="upload-container">
        {/* User Image Box */}
        <div className="upload-box">
          {useWebcam ? (
            <div style={{ width: '100%', marginBottom: '1rem' }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                style={{ borderRadius: '0.5rem' }}
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                <button className="btn btn-primary" onClick={captureWebcam}>
                  <Camera size={18} /> Capture
                </button>
                <button className="btn btn-secondary" onClick={() => setUseWebcam(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : userPreview ? (
            <>
              <img src={userPreview} alt="User" className="image-preview" />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setUserPreview(null)}>Change Photo</button>
              </div>
            </>
          ) : (
            <>
              <UploadIcon className="upload-icon" />
              <h3 className="upload-text">Upload Your Photo</h3>
              <input type="file" accept="image/*" className="upload-input" onChange={handleUserImageUpload} />
              <div style={{ marginTop: '1rem' }}>
                <p style={{ margin: '1rem 0' }}>OR</p>
                <button className="btn btn-secondary" onClick={() => setUseWebcam(true)}>
                  <Camera size={18} /> Use Webcam
                </button>
              </div>
            </>
          )}
        </div>

        {/* Cloth Image Box */}
        <div className="upload-box">
          {clothPreview ? (
            <>
              <img src={clothPreview} alt="Clothing" className="image-preview" />
              <button className="btn btn-secondary" onClick={() => setClothPreview(null)}>Change Item</button>
            </>
          ) : (
            <>
              <ImageIcon className="upload-icon" />
              <h3 className="upload-text">Upload Clothing Item</h3>
              <input type="file" accept="image/*" className="upload-input" onChange={handleClothImageUpload} />
              <button className="btn btn-secondary" style={{ marginTop: '2rem', pointerEvents: 'none' }}>
                Browse Files
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
        <button 
          className="btn btn-primary" 
          style={{ fontSize: '1.25rem', padding: '1rem 3rem' }}
          onClick={handleSubmit}
          disabled={!userPreview || !clothPreview}
        >
          <Send size={24} /> Generate Try-On
        </button>
      </div>
    </div>
  );
}
