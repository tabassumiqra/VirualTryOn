import React, { useState } from 'react';

const Recommend = () => {
  const [formData, setFormData] = useState({
    skinTone: '',
    bodyType: '',
    occasion: '',
    stylePreference: ''
  });
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendation('');

    try {
      const response = await fetch('http://localhost:5000/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recommendation.');
      }

      setRecommendation(data.recommendation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommend-container">
      <div className="recommend-header">
        <h1>AI Stylist</h1>
        <p>Discover the perfect color palette and clothing fit tailored just for you.</p>
      </div>

      <div className="recommend-content">
        <form className="recommend-form card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Skin Tone</label>
            <select name="skinTone" value={formData.skinTone} onChange={handleChange} required>
              <option value="">Select your skin tone</option>
              <option value="Fair">Fair / Light</option>
              <option value="Medium">Medium / Olive</option>
              <option value="Tan">Tan</option>
              <option value="Deep">Deep / Dark</option>
            </select>
          </div>

          <div className="form-group">
            <label>Body Type</label>
            <select name="bodyType" value={formData.bodyType} onChange={handleChange} required>
              <option value="">Select your body type</option>
              <option value="Athletic">Athletic</option>
              <option value="Slim">Slim</option>
              <option value="Curvy">Curvy / Hourglass</option>
              <option value="Plus Size">Plus Size</option>
              <option value="Tall">Tall</option>
              <option value="Petite">Petite</option>
            </select>
          </div>

          <div className="form-group">
            <label>Occasion</label>
            <select name="occasion" value={formData.occasion} onChange={handleChange} required>
              <option value="">Select an occasion</option>
              <option value="Casual Outing">Casual Outing</option>
              <option value="Formal Event">Formal Event</option>
              <option value="Work / Office">Work / Office</option>
              <option value="Date Night">Date Night</option>
              <option value="Party">Party</option>
              <option value="Wedding Guest">Wedding Guest</option>
            </select>
          </div>

          <div className="form-group">
            <label>Any Style Preferences? (Optional)</label>
            <input 
              type="text" 
              name="stylePreference" 
              placeholder="e.g. Minimalist, Vintage, Streetwear"
              value={formData.stylePreference} 
              onChange={handleChange} 
            />
          </div>

          <button type="submit" className="upload-btn" disabled={loading}>
            {loading ? 'Consulting AI...' : 'Get Stylist Recommendation'}
          </button>
        </form>

        <div className="recommend-result card">
          <h2>Your Stylist Says</h2>
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing style combinations...</p>
            </div>
          ) : recommendation ? (
            <div className="recommendation-text">
              {recommendation.split('\\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Fill out the form on the left to reveal your personalized style recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommend;
