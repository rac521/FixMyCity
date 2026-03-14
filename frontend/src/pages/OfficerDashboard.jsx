import React, { useEffect, useState } from 'react';
import { ShieldCheck, Filter, RefreshCw } from 'lucide-react';

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [resolutionFiles, setResolutionFiles] = useState({});

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = new FormData();
      payload.append('complaint_id', id);
      payload.append('status', newStatus);
      payload.append('notes', `Status updated to ${newStatus}`);

      if (newStatus === 'Resolved' && resolutionFiles[id]) {
        payload.append('resolution_image', resolutionFiles[id]);
      }

      const res = await fetch('http://localhost:5000/api/status', {
        method: 'PATCH',
        headers,
        body: payload
      });
      if (res.ok) {
        fetchIssues(); // Refresh data
        // Clear file input state for this row
        setResolutionFiles(prev => {
          const next = {...prev};
          delete next[id];
          return next;
        });
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error updating status.");
      }
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const handleFileChange = (id, file) => {
    setResolutionFiles(prev => ({...prev, [id]: file}));
  };

  const filteredComplaints = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 className="title-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={32} color="var(--primary)" /> Officer Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and update municipal incident reports</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
            <Filter size={18} color="var(--text-muted)" />
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <button className="btn btn-secondary" onClick={fetchIssues} style={{ padding: '0.5rem 1rem' }}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Category & Type</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Priority</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Current Status</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Proof of Fix</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No records found.</td>
                </tr>
              ) : (
                filteredComplaints.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem' }}>#{c.id}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500 }}>{c.category}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.subcategory}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        color: c.upvote_count > 5 ? 'var(--danger)' : 'var(--text-main)',
                        display: 'flex', alignItems: 'center', gap: '0.25rem'
                      }}>
                        {c.upvote_count} upvotes {c.upvote_count > 5 && '🔥'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                       <span className={`status-badge ${
                        c.status === 'Reported' ? 'status-reported' : 
                        c.status === 'Assigned' ? 'status-assigned' : 
                        c.status === 'In Progress' ? 'status-progress' : 'status-resolved'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        className="form-control"
                        style={{ padding: '0.5rem', width: 'auto' }}
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      >
                        <option value="Reported">Reported</option>
                        <option value="Assigned">Assign</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolve</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {c.status !== 'Resolved' && (
                        <div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            id={`file-${c.id}`} 
                            style={{ display: 'none' }}
                            onChange={e => handleFileChange(c.id, e.target.files[0])}
                          />
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: resolutionFiles[c.id] ? 'var(--success)' : '' }}
                            onClick={() => document.getElementById(`file-${c.id}`).click()}
                          >
                            {resolutionFiles[c.id] ? 'Image Ready' : 'Upload Fix'}
                          </button>
                        </div>
                      )}
                      {c.status === 'Resolved' && c.resolution_image_url && (
                        <span style={{ color: 'var(--success)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                           <ShieldCheck size={14} /> Verified Proof
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
