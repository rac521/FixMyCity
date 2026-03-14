import React, { useState } from 'react';
import { Camera, MapPin, CheckCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = {
  'Public Works': ['Potholes', 'Damaged Roads', 'Damaged Sidewalks'],
  'Sanitation': ['Garbage Accumulation', 'Dead Animals', 'Clogged Drains', 'Public Toilet Maintenance'],
  'Water Supply': ['Leaking Fire Hydrant', 'No Water Supply', 'Contaminated Water'],
  'Electricity': ['Broken Streetlight', 'Fallen Power Lines', 'Frequent Outages'],
  'Public Safety': ['Overgrown Bushes (Visibility Issue)', 'Missing Road Signs', 'Unsafe Crosswalks'],
  'Public Infrastructure': ['Damaged Park Bench', 'Broken Playground Equipment', 'Vandalism/Graffiti'],
  'Environment': ['Illegal Dumping', 'Noise Pollution', 'Fallen Trees']
};

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locationStr, setLocationStr] = useState('');
  
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    lat: null,
    lng: null
  });
  const [image, setImage] = useState(null);

  React.useEffect(() => {
    // Reset subcategory when category changes
    setFormData(prev => ({ ...prev, subcategory: '' }));
  }, [formData.category]);

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData({
          ...formData,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStr(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        setLoading(false);
      }, () => {
        alert("Unable to retrieve location. Using default fallback (City Center).");
        setFormData({ ...formData, lat: 40.7128, lng: -74.0060 });
        setLocationStr("40.7128, -74.0060 (Fallback)");
        setLoading(false);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.subcategory || !formData.description || !formData.lat) {
      alert("Please fill all required fields and capture location.");
      return;
    }

    setLoading(true);
    const payload = new FormData();
    payload.append('category', formData.category);
    payload.append('subcategory', formData.subcategory);
    payload.append('description', formData.description);
    payload.append('lat', formData.lat);
    payload.append('lng', formData.lng);
    if (image) payload.append('image', image);

    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('http://localhost:5000/api/report', {
        method: 'POST',
        headers,
        body: payload
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/track'), 2000);
      } else {
        alert("Network error.");
      }
    } catch (err) {
      alert("Error submitting the report. Is the backend running?");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
          <h2>Report Submitted!</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Thank you for helping the community. Redirecting to tracking page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container main-content animate-fade-in delay-200">
      <div className="glass-panel animate-slide-right delay-300" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Report an Issue
        </h2>
        {(!user && localStorage.getItem('token') === null) && (
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: 'var(--primary)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
            <p><strong>Note:</strong> You are reporting as a guest. <a href="/login" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>Login</a> to track your personal reports easily.</p>
          </div>
        )}
        
        <form className="glass-panel" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Department / Category</label>
              <select 
                className="form-control" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select a department...</option>
                {Object.keys(CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Specific Issue Type</label>
              <select 
                className="form-control" 
                value={formData.subcategory} 
                onChange={e => setFormData({...formData, subcategory: e.target.value})}
                required
                disabled={!formData.category}
              >
                <option value="">Select an issue type...</option>
                {formData.category && CATEGORIES[formData.category].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              rows="4" 
              placeholder="Provide specific details about the issue..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="GPS Coordinates" 
                value={locationStr} 
                disabled 
                style={{ flex: 1, cursor: 'not-allowed' }}
              />
              <button type="button" className="btn btn-secondary" onClick={handleCaptureLocation}>
                <MapPin size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Required to dispatch officers accurately.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Photo Evidence (Optional)</label>
            <div style={{ border: '2px dashed var(--card-border)', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
                 onClick={() => document.getElementById('fileUpload').click()}>
              {image ? (
                <span style={{ color: 'var(--success)' }}>Image Selected: {image.name}</span>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  <Camera size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <p>Click to browse files</p>
                </div>
              )}
              <input 
                id="fileUpload" 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }}
                onChange={e => setImage(e.target.files[0])}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
