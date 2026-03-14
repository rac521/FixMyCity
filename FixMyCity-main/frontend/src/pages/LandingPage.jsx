import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, MapPin, Activity, ArrowRight, Camera } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Absolute Glowing Background Orbs */}
      <div className="orb orb-primary" style={{ width: '600px', height: '600px', top: '-200px', left: '-100px' }}></div>
      <div className="orb orb-secondary" style={{ width: '400px', height: '400px', bottom: '100px', right: '-150px' }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '8rem 0 6rem 0' }}>
          <div className="animate-slide-right delay-100" style={{ display: 'inline-block', padding: '0.35rem 1.2rem', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid var(--secondary)', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)' }}>
            Next-Gen Civic Tech Platform
          </div>
          <h1 className="font-heading animate-slide-left delay-200" style={{ fontSize: 'clamp(3.5rem, 7vw, 5.5rem)', marginBottom: '1.5rem', letterSpacing: '-0.02em', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            Empower Your <br />
            <span className="title-gradient title-glow">Community Flow</span>
          </h1>
          <p className="animate-slide-right delay-300" style={{ color: 'var(--text-main)', fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto 3rem', lineHeight: 1.6, fontWeight: 300 }}>
            FixMyCity is an ultra-modern platform for citizens to directly report, track, and upvote local infrastructure issues with their elected municipal authorities.
          </p>
          <div className="animate-fade-in delay-400" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link to="/report" className="btn btn-primary animate-pulse-glow" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Report an Issue <ArrowRight size={20} className="animate-float" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
            </Link>
            <Link to="/map" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              View Live Map
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3" style={{ paddingBottom: '6rem' }}>
          <div className="glass-panel animate-fade-in delay-300" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="animate-float" style={{ background: 'rgba(139, 92, 246, 0.2)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.4), inset 0 2px 10px rgba(139, 92, 246, 0.6)' }}>
              <Camera size={36} />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Snap & Report</h3>
            <p style={{ color: 'var(--text-muted)' }}>Spot a pothole or hazard? Take a photo, pinpoint the GPS location automatically, and submit instantly into the municipal queue.</p>
          </div>
          
          <div className="glass-panel animate-fade-in delay-400" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(20px)' }}>
            <div className="animate-float" style={{ animationDelay: '0.5s', background: 'rgba(6, 182, 212, 0.2)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--secondary)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.4), inset 0 2px 10px rgba(6, 182, 212, 0.6)' }}>
              <MapPin size={36} />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Live Tracking Maps</h3>
            <p style={{ color: 'var(--text-muted)' }}>Explore a gorgeous interactive layout of reported incident clusters in your area, and watch their statuses change in real-time.</p>
          </div>

          <div className="glass-panel animate-fade-in delay-500" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="animate-float" style={{ animationDelay: '1s', background: 'rgba(16, 185, 129, 0.2)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--success)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4), inset 0 2px 10px rgba(16, 185, 129, 0.6)' }}>
              <Activity size={36} />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Proof of Resolution</h3>
            <p style={{ color: 'var(--text-muted)' }}>Don't just believe it's fixed, see it. Track before-and-after photo galleries directly from the municipal dispatch response team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
