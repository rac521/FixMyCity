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
  const [aiData, setAiData] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    lat: null,
    lng: null
  });
  const [image, setImage] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Removed unnecessary handler wrapper

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
      const data = await res.json();
      
      if (res.ok) {
        if (data.is_duplicate) {
          setIsDuplicate(true);
          setAiData(data);
        } else {
          setAiData(data);
          
          // Track issue locally so dashboard can notify on resolution
          if (data.id) {
            const myIssues = JSON.parse(localStorage.getItem('myIssues') || '[]');
            if (!myIssues.includes(data.id)) {
              myIssues.push(data.id);
              localStorage.setItem('myIssues', JSON.stringify(myIssues));
            }
          }
          
          setSuccess(true);
          setTimeout(() => navigate('/track'), 5000); // Wait longer to read AI stats
        }
      } else {
        alert(data.error || "Network error.");
      }
    } catch (err) {
      alert("Error submitting the report. Is the backend running?");
    }
    setLoading(false);
  };

  const handleSupportExisting = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('http://localhost:5000/api/upvote', {
        method: 'POST',
        headers,
        body: JSON.stringify({ complaint_id: aiData.duplicate_complaint_id })
      });
      if (res.ok) {
        setSuccess(true);
        setIsDuplicate(false);
        
        // Track issue locally so dashboard can notify on resolution
        if (aiData.duplicate_complaint_id) {
          const myIssues = JSON.parse(localStorage.getItem('myIssues') || '[]');
          if (!myIssues.includes(aiData.duplicate_complaint_id)) {
            myIssues.push(aiData.duplicate_complaint_id);
            localStorage.setItem('myIssues', JSON.stringify(myIssues));
          }
        }
        
        setTimeout(() => navigate('/track'), 3000);
      } else {
        alert("Failed to support the issue.");
      }
    } catch (err) {
      alert("Error.");
    }
    setLoading(false);
  };

  const getRiskColor = (level) => {
    if (level === 'LOW') return '#10b981';
    if (level === 'MEDIUM') return '#f59e0b';
    if (level === 'HIGH') return '#ef4444';
    return '#38bdf8';
  };

  if (isDuplicate) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <div style={{ color: '#f59e0b', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h2>Duplicate Detected</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{aiData.message}</p>
          
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={handleSupportExisting} disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : 'Support Existing Issue Instead'}
          </button>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '0.75rem' }} onClick={() => { setIsDuplicate(false); navigate('/track'); }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
          <h2>Report Submitted!</h2>
          
          {aiData && aiData.ai_detected_issue && (
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span role="img" aria-label="robot">🤖</span> AI Analysis Results
              </h4>
              
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Detected Issue:</span>
                <strong style={{ textTransform: 'capitalize' }}>{aiData.ai_detected_issue}</strong>
              </div>
              
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Confidence:</span>
                <strong>{Math.round(aiData.confidence_score * 100)}%</strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Risk Level:</span>
                <span style={{ 
                  background: `${getRiskColor(aiData.severity_level)}20`, 
                  color: getRiskColor(aiData.severity_level),
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  border: `1px solid ${getRiskColor(aiData.severity_level)}50`
                }}>
                  {aiData.severity_level} ({aiData.risk_score})
                </span>
              </div>
            </div>
          )}

          <p style={{ color: 'var(--text-muted)', marginTop: '2rem' }}>Redirecting to tracking page...</p>
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
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, subcategory: '' }))}
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
                onChange={e => setFormData(prev => ({...prev, subcategory: e.target.value}))}
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
                onChange={async (e) => {
                  const file = e.target.files[0];
                  setImage(file);
                  if (file) {
                    setAiLoading(true);
                    try {
                      const fd = new FormData();
                      fd.append('image', file);
                      const res = await fetch('http://localhost:8000/ai/classify-issue', {
                        method: 'POST',
                        body: fd
                      });
                      if (res.ok) {
                        const data = await res.json();
                        console.log("AI Response Data:", data);
                        
                        // Force a slight delay to let React fully process the Category update
                        // before attempting to set the Subcategory, avoiding the race condition.
                        setFormData(prev => ({
                          ...prev,
                          category: data.category || prev.category
                        }));
                        
                        setTimeout(() => {
                           setFormData(prev => ({
                             ...prev,
                             subcategory: data.subcategory || prev.subcategory,
                             description: data.description || prev.description
                           }));
                        }, 100);
                      } else {
                        console.error("AI API failed with status:", res.status);
                      }
                    } catch (err) {
                      console.error("Failed to auto-fill AI data:", err);
                    }
                    setAiLoading(false);
                  }
                }}
              />
            </div>
            {aiLoading && <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Loader size={14} className="animate-spin" /> Analyzing image to auto-fill details...</p>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
