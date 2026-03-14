import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, MapPin, Activity, ArrowRight, Camera } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', lineHeight: 1.2 }}>
          Empower Your <br />
          <span className="title-gradient">Community Infrastructure</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          CivicPulse is a modern platform for citizens to report, track, and resolve local infrastructure issues directly with municipal authorities.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/report" className="btn btn-primary">
            Report an Issue <ArrowRight size={18} />
          </Link>
          <Link to="/map" className="btn btn-secondary">
            View Live Map
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 delay-100 animate-fade-in" style={{ paddingBottom: '4rem' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.2)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
            <Camera size={28} />
          </div>
          <h3>Snap & Report</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>See a pothole? Take a photo, tag the location, and submit instantly.</p>
        </div>
        
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.2)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--secondary)' }}>
            <MapPin size={28} />
          </div>
          <h3>Live Tracking Maps</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Explore reported issues in your area to stay informed and safe.</p>
        </div>

        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.2)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--success)' }}>
            <Activity size={28} />
          </div>
          <h3>Direct Resolution</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Upvote critical issues and track municipal progress towards fixing them.</p>
        </div>
      </div>
    </div>
  );
}
