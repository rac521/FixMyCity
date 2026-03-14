import React, { useEffect, useState } from 'react';
import { PieChart as PieChartIcon, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    reported: 0,
    topCategory: 'N/A'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/issues')
      .then(res => res.json())
      .then(data => {
        const total = data.length;
        const resolved = data.filter(c => c.status === 'Resolved').length;
        const inProgress = data.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
        const reported = data.filter(c => c.status === 'Reported').length;
        
        const cats = {};
        data.forEach(c => cats[c.subcategory] = (cats[c.subcategory] || 0) + 1);
        const topCategory = Object.keys(cats).sort((a,b) => cats[b] - cats[a])[0] || 'N/A';

        setStats({ total, resolved, inProgress, reported, topCategory });
        setLoading(false);
      });
  }, []);

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <h1 className="title-gradient" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <PieChartIcon size={32} color="var(--primary)" /> Executive Analytics
      </h1>

      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Reports</p>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{loading ? '-' : stats.total}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckCircle size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Resolved Issues</p>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{loading ? '-' : stats.resolved}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--warning)' }}>
            <AlertTriangle size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pending Resolution</p>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{loading ? '-' : stats.inProgress + stats.reported}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Resolution Rate</h3>
          <div style={{ height: '24px', background: 'rgba(0,0,0,0.3)', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ 
              width: `${stats.total ? (stats.resolved / stats.total) * 100 : 0}%`, 
              background: 'var(--success)', transition: 'width 1s ease-in-out' 
            }}></div>
            <div style={{ 
              width: `${stats.total ? (stats.inProgress / stats.total) * 100 : 0}%`, 
              background: 'var(--warning)', transition: 'width 1s ease-in-out' 
            }}></div>
            <div style={{ 
              width: `${stats.total ? (stats.reported / stats.total) * 100 : 0}%`, 
              background: 'var(--danger)', transition: 'width 1s ease-in-out' 
            }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></div> Resolved</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)' }}></div> In Progress</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }}></div> Unassigned</span>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Most Frequent Issue Category</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--secondary)' }}>{loading ? '...' : stats.topCategory}</p>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
            Focus maintenance dispatch resources towards this category to maximize community impact.
          </p>
        </div>
      </div>
    </div>
  );
}
