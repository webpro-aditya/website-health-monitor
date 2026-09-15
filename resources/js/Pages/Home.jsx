import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Home({ auth, trialDays }) {
    const [dark, setDark] = useState(true);
    const [billingCycle, setBillingCycle] = useState('monthly');

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
            
            <style dangerouslySetInnerHTML={{__html: `
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
  --c-card-bg: #ffffff;
  --c-card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
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
  --c-card-bg: rgba(30, 41, 59, 0.6);
  --c-card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}


html { scroll-behavior: smooth; }
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

/* Nav */
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
.nav-link:hover { opacity: 0.7; }
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
  border: none;
  cursor: pointer;
  display: inline-block;
  text-align: center;
}
.btn-primary:hover { background: var(--c-accent-hover); }
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
.btn-secondary:hover { background: var(--c-btn-secondary-hover); }

/* Common Section */
.section {
  padding: 100px 20px;
  max-width: 1100px;
  margin: 0 auto;
}
.section-header {
  text-align: center;
  margin-bottom: 60px;
}
.section-header h2 {
  font-size: 40px;
  font-weight: 800;
  margin-bottom: 16px;
}
.section-header p {
  font-size: 18px;
  color: var(--c-sub);
  max-width: 600px;
  margin: 0 auto;
}

/* Hero */
.hero {
  padding: 180px 20px 60px;
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
.hero-note { font-size: 13px; color: var(--c-sub); }

/* Mockup */
.mockup-wrapper {
  perspective: 1000px;
  margin: 0 auto 100px;
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
}
[data-theme="dark"] .mockup {
  box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.15), 0 0 100px rgba(99, 102, 241, 0.1);
}
.mockup:hover { transform: rotateX(5deg) rotateY(0) rotateZ(0); }
.mockup-header { height: 48px; border-bottom: 1px solid var(--c-mockup-border); display: flex; align-items: center; padding: 0 16px; gap: 8px; }
.mockup-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--c-border); }
.mockup-dot.red { background: #ef4444; }
.mockup-dot.yellow { background: #eab308; }
.mockup-dot.green { background: #22c55e; }
.mockup-body { padding: 32px; display: flex; gap: 32px; }
.mockup-sidebar { width: 180px; display: flex; flex-direction: column; gap: 16px; }
.mockup-nav-item { height: 24px; border-radius: 6px; background: var(--c-btn-secondary); width: 100%; }
.mockup-nav-item.active { background: rgba(99, 102, 241, 0.1); }
.mockup-content { flex: 1; }
.mockup-chart {
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0) 100%);
  border: 1px solid var(--c-mockup-border); height: 200px; border-radius: 12px; margin-bottom: 24px; position: relative; display: flex; align-items: center; justify-content: center;
}
.mockup-chart h2 { font-size: 48px; color: #22c55e; font-weight: 800; text-shadow: 0 0 20px rgba(34, 197, 94, 0.5); }
.mockup-logs { display: flex; flex-direction: column; gap: 12px; }
.mockup-log { height: 48px; border: 1px solid var(--c-mockup-border); border-radius: 8px; background: var(--c-btn-secondary); display: flex; align-items: center; padding: 0 16px; gap: 16px; }
.mockup-log-icon { width: 24px; height: 24px; border-radius: 50%; background: #22c55e; display: flex; align-items: center; justify-content: center; color: #fff; }
.mockup-log-text { flex: 1; height: 12px; background: var(--c-border); border-radius: 4px; max-width: 200px; }

/* Features */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}
.feature-card {
  background: var(--c-card-bg);
  border: 1px solid var(--c-border);
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: var(--c-card-shadow);
  text-align: center;
  transition: transform 0.2s;
}
.feature-card:hover { transform: translateY(-5px); }
.feature-icon {
  width: 60px; height: 60px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 24px;
  font-size: 24px;
}
.feature-card h3 { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
.feature-card p { color: var(--c-sub); font-size: 15px; line-height: 1.6; }

/* Timeline / How it Works */
.timeline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  max-width: 900px;
  margin: 0 auto;
}
.timeline::before {
  content: '';
  position: absolute;
  top: 30px; left: 10%; right: 10%;
  height: 2px;
  background: var(--c-border);
  z-index: 0;
}
.timeline-step {
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 1;
}
.timeline-number {
  width: 60px; height: 60px;
  border-radius: 50%;
  background: var(--c-accent);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 800;
  margin: 0 auto 24px;
  border: 4px solid var(--c-bg);
  box-shadow: 0 0 0 2px var(--c-border);
}
.timeline-step h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.timeline-step p { color: var(--c-sub); font-size: 14px; max-width: 200px; margin: 0 auto; }

/* Pricing */
.billing-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}
.billing-pill {
  display: flex;
  background: var(--c-card-bg);
  border: 1px solid var(--c-border);
  border-radius: 20px;
  padding: 4px;
}
.billing-pill button {
  padding: 6px 16px;
  border-radius: 16px;
  border: none;
  background: transparent;
  color: var(--c-sub);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.billing-pill button.active {
  background: var(--c-accent);
  color: #fff;
}
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  max-width: 800px;
  margin: 0 auto;
}
.pricing-card {
  background: var(--c-card-bg);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: var(--c-card-shadow);
  display: flex;
  flex-direction: column;
}
.pricing-card.popular {
  border-color: var(--c-accent);
  box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.2);
  transform: scale(1.05);
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, var(--c-card-bg) 100%);
}
.pricing-card h3 { font-size: 20px; font-weight: 600; margin-bottom: 12px; }
.pricing-price { font-size: 48px; font-weight: 800; margin-bottom: 24px; }
.pricing-price span { font-size: 16px; color: var(--c-sub); font-weight: 400; }
.pricing-features { flex: 1; margin-bottom: 32px; list-style: none; }
.pricing-features li { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 15px; color: var(--c-sub); }
.pricing-features svg { color: var(--c-accent); width: 18px; height: 18px; }
.pricing-card .btn-primary, .pricing-card .btn-secondary { width: 100%; text-align: center; }

/* Final CTA */
.final-cta {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(49, 46, 129, 0.1));
  border-top: 1px solid var(--c-border);
  border-bottom: 1px solid var(--c-border);
  padding: 100px 20px;
  text-align: center;
}
.final-cta h2 { font-size: 48px; font-weight: 800; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.2; }

/* Footer */
.footer {
  background: var(--c-footer-bg);
  padding: 80px 40px 40px;
  border-top: 1px solid var(--c-border);
}
.footer-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  margin-bottom: 60px;
}
.footer-col h4 { font-size: 14px; font-weight: 700; margin-bottom: 24px; color: var(--c-text); text-transform: uppercase; letter-spacing: 1px; }
.footer-col ul { list-style: none; }
.footer-col li { margin-bottom: 12px; }
.footer-col a { color: var(--c-sub); text-decoration: none; font-size: 14px; transition: color 0.2s; }
.footer-col a:hover { color: var(--c-accent); }
.footer-bottom { max-width: 1100px; margin: 0 auto; border-top: 1px solid var(--c-border); padding-top: 32px; display: flex; justify-content: space-between; align-items: center; color: var(--c-sub); font-size: 14px; }

@media(max-width: 900px) {
  .section { padding: 60px 20px; }
  .section-header { margin-bottom: 40px; }
  .hero { padding: 120px 20px 40px; }
  .hero p { margin-bottom: 30px; }
  .mockup-wrapper { margin-bottom: 60px; }
  .final-cta { padding: 60px 20px; }
  .final-cta h2 { font-size: 36px; margin-bottom: 24px; }
  .footer { padding: 60px 20px 30px; }
  .footer-grid { margin-bottom: 40px; }

  .features-grid, .pricing-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
  .timeline { flex-direction: column; gap: 32px; align-items: flex-start; padding-left: 20px; position: relative; }
  .timeline::before { display: block; top: 0; bottom: 0; left: 44px; width: 2px; height: auto; }
  .timeline-step { display: flex; text-align: left; align-items: flex-start; gap: 24px; flex-direction: row; }
  .timeline-number { margin: 0; width: 48px; height: 48px; font-size: 20px; flex-shrink: 0; z-index: 2; }
  .timeline-step > div:not(.timeline-number) { display: flex; flex-direction: column; justify-content: center; padding-top: 4px; }
  .timeline-step h3 { margin-bottom: 4px; }
  .timeline-step p { margin: 0; max-width: none; }
  .pricing-card.popular { transform: scale(1); }
  .hero h1 { font-size: 42px; }
  .nav-links { display: none; }
  .mockup-body { flex-direction: column; }
  .mockup-sidebar { display: none; }
}
@media(max-width: 500px) {
  .footer-grid { grid-template-columns: 1fr; text-align: center; }
}
`}} />

            <nav className="nav">
                <Link href="/" className="nav-logo">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Website Health Monitor
                </Link>
                
                <div className="nav-links">
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#how-it-works" className="nav-link">How it Works</a>
                    <a href="#pricing" className="nav-link">Pricing</a>
                    
                    {auth.user ? (
                        <Link href={route('dashboard')} className="btn-primary">Go to Dashboard →</Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="nav-link">Sign In</Link>
                            <Link href={route('register')} className="btn-primary">Start {trialDays ? trialDays + '-day ' : ''}Free Trial</Link>
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
                    <p>Get instant alerts via SMS and Email when your site goes down. Trusted by over 10,000 developers worldwide.</p>
                    
                    <div className="hero-actions">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="btn-primary">Go to Dashboard</Link>
                        ) : (
                            <>
                                <Link href={route('register')} className="btn-primary">Start your {trialDays ? trialDays + '-day ' : ''}free trial</Link>
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
                                        <div className="mockup-log-text" style={{width: '60%'}}></div>
                                    </div>
                                    <div className="mockup-log">
                                        <div className="mockup-log-icon">✓</div>
                                        <div className="mockup-log-text" style={{width: '40%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{textAlign: 'center', marginTop: '40px'}}>
                        <div style={{fontSize: '15px', color: 'var(--c-sub)', marginBottom: '12px'}}>Not ready to choose a plan?</div>
                        <Link href={route('register') + "?plan=free_trial"} 
                            style={{
                                display: 'inline-block',
                                padding: '12px 32px',
                                borderRadius: '8px',
                                border: '1px solid var(--c-border)',
                                background: 'var(--c-card-bg)',
                                color: 'var(--c-text)',
                                fontWeight: '600',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                boxShadow: 'var(--c-card-shadow)'
                            }}>
                            Start {trialDays}-Day Free Trial (No Credit Card Required)
                        </Link>
                    </div>
                </section>

                <section id="features" className="section">
                    <div className="section-header">
                        <h2>Enterprise-Grade Features</h2>
                        <p>Everything you need to ensure your applications stay online and highly performant.</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            </div>
                            <h3>Global Ping Network</h3>
                            <p>We check your websites from multiple locations around the world every minute to prevent false positives.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                            </div>
                            <h3>Instant Alerts</h3>
                            <p>Receive notifications via Email or SMS within seconds of a detected outage.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                            </div>
                            <h3>Uptime SLA</h3>
                            <p>Generate beautiful public status pages to build trust with your customers and show your reliability.</p>
                        </div>
                    </div>

                    <div style={{textAlign: 'center', marginTop: '40px'}}>
                        <div style={{fontSize: '15px', color: 'var(--c-sub)', marginBottom: '12px'}}>Not ready to choose a plan?</div>
                        <Link href={route('register') + "?plan=free_trial"} 
                            style={{
                                display: 'inline-block',
                                padding: '12px 32px',
                                borderRadius: '8px',
                                border: '1px solid var(--c-border)',
                                background: 'var(--c-card-bg)',
                                color: 'var(--c-text)',
                                fontWeight: '600',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                boxShadow: 'var(--c-card-shadow)'
                            }}>
                            Start {trialDays}-Day Free Trial (No Credit Card Required)
                        </Link>
                    </div>
                </section>

                <section id="how-it-works" className="section" style={{ marginTop: '40px' }}>
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Get set up in less than 2 minutes.</p>
                    </div>
                    <div className="timeline">
                        <div className="timeline-step">
                            <div className="timeline-number">1</div>
                            <div>
                                <h3>Add Domain</h3>
                                <p>Enter your website URL or API endpoint.</p>
                            </div>
                        </div>
                        <div className="timeline-step">
                            <div className="timeline-number">2</div>
                            <div>
                                <h3>Set Alerts</h3>
                                <p>Configure Email or SMS notifications.</p>
                            </div>
                        </div>
                        <div className="timeline-step">
                            <div className="timeline-number">3</div>
                            <div>
                                <h3>Get Notified</h3>
                                <p>We'll alert you immediately if anything goes wrong.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{textAlign: 'center', marginTop: '40px'}}>
                        <div style={{fontSize: '15px', color: 'var(--c-sub)', marginBottom: '12px'}}>Not ready to choose a plan?</div>
                        <Link href={route('register') + "?plan=free_trial"} 
                            style={{
                                display: 'inline-block',
                                padding: '12px 32px',
                                borderRadius: '8px',
                                border: '1px solid var(--c-border)',
                                background: 'var(--c-card-bg)',
                                color: 'var(--c-text)',
                                fontWeight: '600',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                boxShadow: 'var(--c-card-shadow)'
                            }}>
                            Start {trialDays}-Day Free Trial (No Credit Card Required)
                        </Link>
                    </div>
                </section>

                <section id="pricing" className="section" style={{ marginTop: '40px' }}>
                    <div className="section-header">
                        <h2>Simple, Transparent Pricing</h2>
                        <p>Choose the plan that fits your engineering team.</p>
                    </div>

                    <div className="billing-toggle">
                        <div className="billing-pill">
                            <button type="button" className={billingCycle === 'monthly' ? 'active' : ''} onClick={() => setBillingCycle('monthly')}>Monthly</button>
                            <button type="button" className={billingCycle === 'yearly' ? 'active' : ''} onClick={() => setBillingCycle('yearly')}>Yearly</button>
                        </div>
                    </div>

                    <div className="pricing-grid">
                        <div className="pricing-card popular">
                            <h3>Pro</h3>
                            <div className="pricing-price">{billingCycle === 'monthly' ? '₹499' : '₹4990'}<span>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span></div>
                            <ul className="pricing-features">
                                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Up to 15 domains</li>
                                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> 1-minute checks</li>
                                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Email & SMS alerts</li>
                            </ul>
                            <Link href={route('register') + `?plan=pro_${billingCycle}`} className="btn-primary">Subscribe</Link>
                        </div>
                        <div className="pricing-card">
                            <h3>Enterprise</h3>
                            <div className="pricing-price">{billingCycle === 'monthly' ? '₹1499' : '₹14990'}<span>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span></div>
                            <ul className="pricing-features">
                                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Up to 50 domains</li>
                                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> 30-second checks</li>
                                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Custom SLA</li>
                                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Priority Support</li>
                            </ul>
                            <Link href={route('register') + `?plan=enterprise_${billingCycle}`} className="btn-secondary">Subscribe</Link>
                        </div>
                    </div>

                    <div style={{textAlign: 'center', marginTop: '40px'}}>
                        <div style={{fontSize: '15px', color: 'var(--c-sub)', marginBottom: '12px'}}>Not ready to choose a plan?</div>
                        <Link href={route('register') + "?plan=free_trial"} 
                            style={{
                                display: 'inline-block',
                                padding: '12px 32px',
                                borderRadius: '8px',
                                border: '1px solid var(--c-border)',
                                background: 'var(--c-card-bg)',
                                color: 'var(--c-text)',
                                fontWeight: '600',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                boxShadow: 'var(--c-card-shadow)'
                            }}>
                            Start {trialDays}-Day Free Trial (No Credit Card Required)
                        </Link>
                    </div>
                </section>

                <section className="final-cta">
                    <h2>Ready to stop worrying about downtime?</h2>
                    <Link href={route('register')} className="btn-primary" style={{ fontSize: '18px', padding: '16px 32px' }}>Start your {trialDays ? trialDays + '-day ' : ''}free trial</Link>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h4>Product</h4>
                        <ul>
                            <li><a href="#">Features</a></li>
                            <li><a href="#">Pricing</a></li>
                            <li><a href="#">Status Page</a></li>
                            <li><a href="#">API Documentation</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Resources</h4>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Community</a></li>
                            <li><a href="#">Webinars</a></li>
                            <li><a href="#">Partners</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Cookie Policy</a></li>
                            <li><a href="#">Security</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="footer-logo" style={{ color: 'var(--c-accent)', fontWeight: 'bold' }}>
                        Website Health Monitor
                    </div>
                    <div>&copy; {new Date().getFullYear()} Website Health Monitor. All rights reserved.</div>
                </div>
            </footer>
        </>
    );
}
