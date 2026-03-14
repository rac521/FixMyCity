import React, { useState } from 'react';
import { Camera, MapPin, CheckCircle, Loader, Sparkles } from 'lucide-react';
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
  const [submitResult, setSubmitResult] = useState(''); // '', 'CREATED', 'MERGED'
  const [locationStr, setLocationStr] = useState('');
  
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    lat: null,
    lng: null
  });
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFilled, setAiFilled] = useState(false);

  const aiUpdateRef = React.useRef(false);

  React.useEffect(() => {
    // Reset subcategory when category changes manually, but skip if AI just filled it
    if (aiUpdateRef.current) {
      aiUpdateRef.current = false;
      return;
    }
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setAiFilled(false);
  };

  const handleTriggerAI = async (e) => {
    e.stopPropagation();
    if (!image) return;
    
    setIsAnalyzing(true);
    setAiFilled(false);
    
    // Trigger AI Vision Mock Analysis
    const payload = new FormData();
    payload.append('image', image);
    
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:5000/api/analyze-image', {
        method: 'POST',
        headers,
        body: payload
      });
      
      if (res.ok) {
        const aiData = await res.json();
        aiUpdateRef.current = true; // prevent the useEffect from wiping subcategory
        
        setFormData(prev => ({
          ...prev,
          category: aiData.category,
          subcategory: aiData.subcategory,
          description: aiData.description
        }));
        setAiFilled(true);
      } else {
        const errData = await res.json();
        console.error("Backend returned error or fallback", errData);
        alert(`AI Error: ${errData.error || 'Failed to analyze'}. Using fallback.`);
        if (errData.category) {
          aiUpdateRef.current = true;
          setFormData(prev => ({
            ...prev,
            category: errData.category,
            subcategory: errData.subcategory,
            description: errData.description
          }));
          setAiFilled(true);
        }
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
      alert("Network error connecting to AI analysis server.");
    }
    
    setIsAnalyzing(false);
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
        const resultData = await res.json();
        
        if (resultData.merged) {
          setSubmitResult('MERGED');
          // Add a slight delay before redirecting to allow user to read the message
          setTimeout(() => navigate('/track'), 4500);
        } else {
          setSubmitResult('CREATED');
          setTimeout(() => navigate('/track'), 2000);
        }
      } else {
        alert("Network error.");
      }
    } catch (err) {
      alert("Error submitting the report. Is the backend running?");
    }
    setLoading(false);
  };

  if (submitResult !== '') {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-panel animate-scale-in" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '500px' }}>
          {submitResult === 'MERGED' ? (
            <>
              <Sparkles size={64} color="var(--primary)" className="animate-pulse-glow" style={{ margin: '0 auto 1.5rem' }} />
              <h2 className="title-gradient" style={{ marginBottom: '1rem' }}>Duplicate Prevented! ✨</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Our AI noticed someone already reported this exact issue at this location! <br/><br/>
                Instead of creating clutter, we instantly <strong>merged your report</strong> into the original and <strong>boosted its priority</strong> for the city officers.
              </p>
            </>
          ) : (
            <>
              <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
              <h2 className="title-gradient" style={{ marginBottom: '1rem' }}>Report Submitted!</h2>
              <p style={{ color: 'var(--text-muted)' }}>Thank you for helping keep the community safe. You'll be redirected shortly.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container main-content animate-fade-in delay-200">
      <div className="glass-panel animate-slide-right delay-300" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          Report an Issue
          {aiFilled && <span className="status-badge status-resolved animate-fade-in delay-200" style={{ fontSize: '1rem', marginLeft: '1rem' }}><Sparkles size={16}/> AI Auto-Filled</span>}
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
            <label className="form-label">Photo Evidence</label>
            <div style={{ border: `2px dashed ${isAnalyzing ? 'var(--primary)' : 'var(--card-border)'}`, borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', background: isAnalyzing ? 'rgba(192, 132, 252, 0.05)' : 'transparent' }}
                 className={isAnalyzing ? 'animate-pulse-glow' : ''}
                 onClick={() => document.getElementById('fileUpload').click()}>
              {isAnalyzing ? (
                <div style={{ color: 'var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader className="animate-float" size={32} />
                  <p>✨ AI is analyzing image...</p>
                </div>
              ) : image ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--success)' }}>Image Selected: {image.name}</span>
                  {!aiFilled && (
                    <button type="button" className="btn btn-secondary animate-pulse-glow" onClick={handleTriggerAI} style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                      <Sparkles size={16} /> Analyze with AI magic
                    </button>
                  )}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Click anywhere else to replace image</p>
                </div>
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
                onChange={handleImageSelect}
                style={{ display: 'none' }}
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
