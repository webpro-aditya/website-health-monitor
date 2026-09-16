import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Welcome({ auth }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('whm-theme');
    if (saved === 'light') {
      setDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('whm-theme', next ? 'dark' : 'light');
  };

  return (
    <>
      <Head title="Website Health Monitor - Enterprise Uptime" />

      <style dangerouslySetInnerHTML={{
        __html: `
:root {
  --c-bg: #f8fafc;
  --c-bg-nav: rgba(248, 250, 252, 0.8);
  --c-text: #0f172a;
  --c-sub: #64748b;
  --c-border: #e2e8f0;
  --c-accent: #4f46e5;
  --c-accent-hover: #4338ca;
  --c-btn-secondary: #f1f5f9;
  --c-btn-secondary-hover: #e2e8f0;
  --c-footer-bg: #f1f5f9;
  --c-mockup-bg: rgba(255, 255, 255, 0.9);
  --c-mockup-border: rgba(0, 0, 0, 0.1);
  --c-grid: rgba(0, 0, 0, 0.05);
}
[data-theme="dark"] {
  --c-bg: #0f0c29;
  --c-bg-nav: rgba(15, 12, 41, 0.8);
  --c-text: #f8fafc;
  --c-sub: #94a3b8;
  --c-border: #334155;
  --c-accent: #6366f1;
  --c-accent-hover: #4f46e5;
  --c-btn-secondary: rgba(255, 255, 255, 0.05);
  --c-btn-secondary-hover: rgba(255, 255, 255, 0.1);
  --c-footer-bg: rgba(255,255,255,0.02);
  --c-mockup-bg: rgba(30, 41, 59, 0.8);
  --c-mockup-border: rgba(255, 255, 255, 0.1);
  --c-grid: rgba(255, 255, 255, 0.03);
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--c-bg);
  color: var(--c-text);
  overflow-x: hidden;
  position: relative;
  transition: background 0.3s, color 0.3s;
}

body::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: linear-gradient(var(--c-grid) 1px, transparent 1px), linear-gradient(90deg, var(--c-grid) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: -1;
}

.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  backdrop-filter: blur(12px);
  background: var(--c-bg-nav);
  border-bottom: 1px solid var(--c-border);
  z-index: 100;
}
.nav-logo {
  color: var(--c-accent);
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 20px;
  text-decoration: none;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}
.nav-link {
  color: var(--c-text);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: opacity 0.2s;
}
.nav-link:hover {
  opacity: 0.7;
}
.theme-toggle {
  background: var(--c-btn-secondary);
  border: 1px solid var(--c-border);
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  color: var(--c-text);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  margin-left: 16px;
}
.btn-primary {
  background: var(--c-accent);
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: var(--c-accent-hover);
}
.btn-secondary {
  background: var(--c-btn-secondary);
  color: var(--c-text);
  border: 1px solid var(--c-border);
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: background 0.2s;
}
.btn-secondary:hover {
  background: var(--c-btn-secondary-hover);
}

.hero {
  padding: 180px 20px 100px;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}
.hero h1 {
  font-size: 64px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
}
.hero p {
  font-size: 20px;
  color: var(--c-sub);
  line-height: 1.5;
  margin-bottom: 40px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}
.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}
.hero-note {
  font-size: 13px;
  color: var(--c-sub);
}

.mockup-wrapper {
  perspective: 1000px;
  margin: 60px auto 100px;
  max-width: 900px;
  padding: 0 20px;
}
.mockup {
  background: var(--c-mockup-bg);
  border: 1px solid var(--c-mockup-border);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  backdrop-filter: blur(20px);
  transform: rotateX(15deg) rotateY(-5deg) rotateZ(2deg);
  transition: transform 0.5s ease;
  overflow: hidden;
  position: relative;
}
[data-theme="dark"] .mockup {
  box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.15), 0 0 100px rgba(99, 102, 241, 0.1);
}
.mockup:hover {
  transform: rotateX(5deg) rotateY(0) rotateZ(0);
}
.mockup-header {
  height: 48px;
  border-bottom: 1px solid var(--c-mockup-border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
}
.mockup-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--c-border);
}
.mockup-dot.red { background: #ef4444; }
.mockup-dot.yellow { background: #eab308; }
.mockup-dot.green { background: #22c55e; }
.mockup-body {
  padding: 32px;
  display: flex;
  gap: 32px;
}
.mockup-sidebar {
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mockup-nav-item {
  height: 24px;
  border-radius: 6px;
  background: var(--c-btn-secondary);
  width: 100%;
}
.mockup-nav-item.active {
  background: rgba(99, 102, 241, 0.1);
}
.mockup-content {
  flex: 1;
}
.mockup-chart {
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0) 100%);
  border: 1px solid var(--c-mockup-border);
  height: 200px;
  border-radius: 12px;
  margin-bottom: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mockup-chart h2 {
  font-size: 48px;
  color: #22c55e;
  font-weight: 800;
  text-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
}
.mockup-logs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mockup-log {
  height: 48px;
  border: 1px solid var(--c-mockup-border);
  border-radius: 8px;
  background: var(--c-btn-secondary);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
}
.mockup-log-icon {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: #22c55e;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}
.mockup-log-text {
  flex: 1;
  height: 12px;
  background: var(--c-border);
  border-radius: 4px;
  max-width: 200px;
}

.footer {
  background: var(--c-footer-bg);
  border-top: 1px solid var(--c-border);
  padding: 60px 20px;
  text-align: center;
}
.footer-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--c-sub);
  margin-bottom: 32px;
  font-weight: 600;
}
.logos-row {
  display: flex;
  justify-content: center;
  gap: 48px;
  opacity: 0.5;
  align-items: center;
  flex-wrap: wrap;
}
.logos-row span {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}

@media(max-width: 768px) {
  .hero h1 { font-size: 42px; }
  .nav-links { display: none; }
  .mockup-body { flex-direction: column; }
  .mockup-sidebar { display: none; }
}
`}} />

      <nav className="nav">
        <Link href="/" className="nav-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          Website Health Monitor
        </Link>

        <div className="nav-links">
          <a href="#" className="nav-link">Features</a>
          <a href="#" className="nav-link">Pricing</a>
          <a href="#" className="nav-link">Docs</a>

          {auth.user ? (
            <Link href={route('dashboard')} className="btn-primary">Go to Dashboard →</Link>
          ) : (
            <>
              <Link href={route('login')} className="nav-link">Sign In</Link>
              <Link href={route('register', { plan: 'free_trial' })} className="btn-primary">Start Free Trial</Link>
            </>
          )}

          <button type="button" className="theme-toggle" onClick={toggleTheme}>
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <main>
        <section className="hero">
          <h1>Monitor your websites with enterprise reliability.</h1>
          <p>Get instant alerts via WhatsApp, SMS, and Email when your site goes down. Trusted by over 10,000 developers worldwide.</p>

          <div className="hero-actions">
            {auth.user ? (
              <Link href={route('dashboard')} className="btn-primary">Go to Dashboard</Link>
            ) : (
              <>
                <Link href={route('register', { plan: 'free_trial' })} className="btn-primary">Start your 14-day free trial</Link>
                <a href="#pricing" className="btn-secondary">View Pricing</a>
              </>
            )}
          </div>
          <div className="hero-note">No credit card required. Cancel anytime.</div>
        </section>

        <section className="mockup-wrapper">
          <div className="mockup">
            <div className="mockup-header">
              <div className="mockup-dot red"></div>
              <div className="mockup-dot yellow"></div>
              <div className="mockup-dot green"></div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-nav-item active"></div>
                <div className="mockup-nav-item"></div>
                <div className="mockup-nav-item"></div>
                <div className="mockup-nav-item"></div>
              </div>
              <div className="mockup-content">
                <div className="mockup-chart">
                  <h2>100% Uptime</h2>
                </div>
                <div className="mockup-logs">
                  <div className="mockup-log">
                    <div className="mockup-log-icon">✓</div>
                    <div className="mockup-log-text" style={{ width: '60%' }}></div>
                  </div>
                  <div className="mockup-log">
                    <div className="mockup-log-icon">✓</div>
                    <div className="mockup-log-text" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-title">Trusted by Engineering Teams At</div>
        <div className="logos-row">
          <span>TECHCORP</span>
          <span>ACME INC</span>
          <span>CLOUDNET</span>
          <span>DATAFLOW</span>
          <span>APEX</span>
        </div>
      </footer>
    </>
  );
}
