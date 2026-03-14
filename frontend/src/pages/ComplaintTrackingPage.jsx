import React, { useEffect, useState } from 'react';
import { ThumbsUp, MapPin, Clock } from 'lucide-react';

export default function ComplaintTrackingPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/issues');
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id) => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:5000/api/upvote', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ complaint_id: id })
      });
      
      if (res.status === 403) {
         alert("Please log in to upvote issues.");
         return;
      }
      
      fetchIssues(); // refresh counts
    } catch (err) {
      alert("Error upvoting.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Reported': return 'status-reported';
      case 'Assigned': return 'status-assigned';
      case 'In Progress': return 'status-progress';
      case 'Resolved': return 'status-resolved';
      default: return 'status-reported';
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <h1 className="title-gradient" style={{ marginBottom: '2rem' }}>Community Issues Tracker</h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading records...</div>
      ) : complaints.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center' }}>No complaints found in the local area.</div>
      ) : (
        <div className="grid grid-cols-2">
          {complaints.map(c => (
            <div key={c.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{c.category}</h3>
                  <span style={{ display: 'inline-block', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>{c.subcategory}</span>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <MapPin size={14} /> Localized Issue #{c.id}
                  </div>
                </div>
                <span className={`status-badge ${getStatusClass(c.status)}`}>{c.status}</span>
              </div>
              
              <p style={{ color: 'var(--text-main)' }}>{c.description}</p>
              
              {c.status === 'Resolved' && c.resolution_image_url ? (
                <div style={{ display: 'flex', gap: '0.5rem', height: '150px' }}>
                  <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', background: '#000', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', fontSize: '0.7rem', borderRadius: '4px' }}>Before</span>
                    {c.image_url ? <img src={`http://localhost:5000${c.image_url}`} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>No Image</div>}
                  </div>
                  <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', background: '#000', position: 'relative', border: '2px solid var(--success)' }}>
                    <span style={{ position: 'absolute', top: 4, left: 4, background: 'var(--success)', color: 'white', padding: '2px 6px', fontSize: '0.7rem', borderRadius: '4px' }}>After</span>
                    <img src={`http://localhost:5000${c.resolution_image_url}`} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              ) : (
                c.image_url && (
                  <div style={{ width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                    <img src={`http://localhost:5000${c.image_url}`} alt="Issue" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )
              )}

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={14} /> {new Date(c.created_at).toLocaleDateString()}
                </span>
                
                <button 
                  onClick={() => handleUpvote(c.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '9999px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 'bold' }}
                >
                  <ThumbsUp size={16} /> {c.upvote_count} Upvotes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
