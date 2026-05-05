import React, { useState } from 'react';

const Recommend = () => {
  const [formData, setFormData] = useState({
    gender: '',
    season: '',
    occasion: '',
    stylePreference: ''
  });
  const [userImage, setUserImage] = useState(null);
  const [userPreview, setUserPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserImage(file);
      setUserPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userImage) {
      setError('Please upload a photo of yourself.');
      return;
    }
    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (userImage) {
        submitData.append('userImage', userImage);
      }

      const response = await fetch('http://localhost:5000/api/recommend', {
        method: 'POST',
        body: submitData
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
          <div className="form-group" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <label>Upload Your Photo</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Our AI Stylist will analyze your features automatically to find your best colors!
            </p>
            {userPreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={userPreview} alt="User" className="image-preview" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', marginBottom: '1rem' }} />
                <button type="button" className="btn btn-secondary" onClick={() => { setUserImage(null); setUserPreview(null); }} style={{ position: 'absolute', bottom: '0', right: '0', padding: '0.5rem' }}>
                  Remove
                </button>
              </div>
            ) : (
              <input type="file" accept="image/*" className="upload-input" onChange={handleImageUpload} />
            )}
          </div>

          <hr style={{ margin: '1rem 0', borderColor: 'var(--border-color)', opacity: 0.5 }} />

          <div className="form-group">
            <label>Gender / Identity</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Any">Any / Unisex</option>
            </select>
          </div>

          <div className="form-group">
            <label>Season / Weather</label>
            <select name="season" value={formData.season} onChange={handleChange} required>
              <option value="">Select the season</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Autumn / Fall">Autumn / Fall</option>
              <option value="Winter">Winter</option>
              <option value="All Season">All Season</option>
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Consulting AI Stylist...' : '✨ Get Stylist Recommendation ✨'}
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
          ) : recommendation && recommendation.outfits ? (
            <div className="recommendation-results">
              {recommendation.color_palette && recommendation.color_palette.length > 0 && (
                <div className="color-palette-section">
                  <h3>Your Recommended Palette</h3>
                  <div className="palette-container">
                    {recommendation.color_palette.map((color, idx) => (
                      <span key={idx} className="color-chip">{color}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="outfits-list">
                {recommendation.outfits.map((outfit, idx) => (
                  <div key={idx} className="outfit-card">
                    <h4>{idx + 1}. {outfit.title}</h4>
                    <p><strong>Description:</strong> {outfit.description}</p>
                    <p><strong>Body Type Fit:</strong> {outfit.body_type_reason}</p>
                    <p><strong>Color Match:</strong> {outfit.color_reason}</p>
                    <p><strong>Styling Tips:</strong> {outfit.styling_tips}</p>
                    {outfit.recommended_colors && outfit.recommended_colors.length > 0 && (
                      <p><strong>Key Colors:</strong> {outfit.recommended_colors.join(', ')}</p>
                    )}
                    

                  </div>
                ))}
              </div>
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
