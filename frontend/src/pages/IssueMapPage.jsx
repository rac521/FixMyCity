import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export default function IssueMapPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center] = useState([40.7128, -74.0060]);

  useEffect(() => {
    fetch('http://localhost:5000/api/issues')
      .then(res => res.json())
      .then(data => {
        const validCoords = data.filter(c => c.lat != null && c.lng != null);
        setComplaints(validCoords);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container" style={{ paddingTop: '2rem' }}>Loading map data...</div>;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Resolved': return 'var(--success)';
      case 'In Progress': return 'var(--warning)';
      case 'Assigned': return 'var(--secondary)';
      default: return 'var(--primary)';
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '3rem', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="title-gradient">Live Issue Map</h1>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }}></div> Reported</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--warning)' }}></div> In Progress</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--success)' }}></div> Resolved</span>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: 0, overflow: 'hidden', borderRadius: '16px', position: 'relative', zIndex: 1 }}>
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', background: '#1e293b' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {complaints.map(complaint => {
            const mProps = {
              icon: new L.DivIcon({
                className: 'custom-leaflet-marker',
                html: `<div style="background-color: ${getStatusColor(complaint.status)}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })
            };
            return (
              <Marker key={complaint.id} position={[complaint.lat, complaint.lng]} {...mProps}>
                <Popup className="custom-popup">
                  <div style={{ padding: '0.5rem', color: '#333' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#000' }}>{complaint.category}</h4>
                    <span style={{ display: 'inline-block', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>{complaint.subcategory}</span>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>{complaint.description.substring(0, 60)}...</p>
                    <span style={{ 
                      background: getStatusColor(complaint.status), 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {complaint.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  );
}
