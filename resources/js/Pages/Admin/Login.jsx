import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function AdminLogin({ status }) {
    const [showPassword, setShowPassword] = useState(false);
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

    useEffect(() => {
        localStorage.setItem('whm-theme', dark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    }, [dark]);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Admin Log in" />
            <style dangerouslySetInnerHTML={{__html: `
:root{
  --c-bg: #ffffff;
  --c-text: #0f172a;
  --c-sub: #64748b;
  --c-border: #e2e8f0;
  --c-input-bg: #ffffff;
  --c-card-bg: #f8fafc;
  --c-accent: #8b5cf6;
  --c-accent-hover: #7c3aed;
}
[data-theme="dark"]{
  --c-bg: #0f172a;
  --c-text: #f8fafc;
  --c-sub: #94a3b8;
  --c-border: #334155;
  --c-input-bg: #0f172a;
  --c-card-bg: #1e293b;
  --c-accent: #a855f7;
  --c-accent-hover: #9333ea;
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{
  font-family:'Inter',system-ui,sans-serif;
  margin:0;
  padding:0;
  background:var(--c-bg);
  color:var(--c-text);
}

.split-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

/* Left Panel - Admin Specific Theme (Purple/Dark Slate) */
.split-left {
  flex: 0 0 45%;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  color: white;
}
.split-left::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}
/* Subtle admin orb */
.split-left::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: #a855f7;
  filter: blur(120px);
  opacity: 0.3;
  top: -100px;
  left: -100px;
  border-radius: 50%;
  pointer-events: none;
}

.left-content {
  position: relative;
  z-index: 1;
  max-width: 500px;
  margin: 0 auto;
}
.left-title {
  font-size: 42px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
  background: linear-gradient(to right, #e2e8f0, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.left-desc {
  font-size: 16px;
  color: #cbd5e1;
  line-height: 1.6;
  margin-bottom: 48px;
}
.stats-row {
  display: flex;
  gap: 32px;
  margin-bottom: 48px;
}
.stat-item h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #a855f7;
}
.stat-item p {
  font-size: 13px;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin-bottom: 32px;
}
.logos-row {
  display: flex;
  gap: 24px;
  opacity: 0.5;
  align-items: center;
}
.logos-row span {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
}

/* Right Panel */
.split-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  position: relative;
  background: var(--c-bg);
  transition: background 0.3s;
}
.theme-toggle {
  position: absolute;
  top: 24px;
  right: 24px;
  background: var(--c-card-bg);
  border: 1px solid var(--c-border);
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  color: var(--c-text);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.form-container {
  width: 100%;
  max-width: 420px;
}

/* Header */
.form-header {
  text-align: center;
  margin-bottom: 32px;
}
.shield-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--c-accent), #6366f1);
  color: white;
  margin-bottom: 24px;
  box-shadow: 0 10px 25px rgba(168, 85, 247, 0.4);
}
.form-header h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}
.form-header p {
  color: var(--c-sub);
  font-size: 14px;
}

/* Form */
.form-group {
  margin-bottom: 20px;
}
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 8px;
}
.input-wrap {
  position: relative;
}
.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-sub);
  pointer-events: none;
}
.form-input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  background: var(--c-input-bg);
  border: 1px solid var(--c-border);
  border-radius: 10px;
  color: var(--c-text);
  font-size: 14px;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
}
.form-input:focus {
  border-color: var(--c-accent);
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
}
.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--c-accent), #6366f1);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}
.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.4);
}
.btn-submit.loading {
  opacity: 0.7;
  cursor: not-allowed;
}
.form-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--c-sub);
}
.form-footer a {
  color: var(--c-accent);
  text-decoration: none;
  font-weight: 600;
}
.remember-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 13px;
}
.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--c-sub);
  cursor: pointer;
}
.remember-label input {
  accent-color: var(--c-accent);
}

@media(max-width: 900px) {
  .split-layout { flex-direction: column; }
  .split-left { flex: none; padding: 40px 20px; }
}
`}} />

            <div className="split-layout" data-theme={dark ? 'dark' : 'light'}>
                
                {/* Left Panel */}
                <div className="split-left">
                    <div className="left-content">
                        <h1 className="left-title">System<br/>Administration</h1>
                        <p className="left-desc">
                            Secure access gateway for infrastructure management and global monitoring controls.
                        </p>
                        
                        <div className="stats-row">
                            <div className="stat-item">
                                <h3>SECURE</h3>
                                <p>Encrypted Tunnel</p>
                            </div>
                            <div className="stat-item">
                                <h3>GLOBAL</h3>
                                <p>Node Access</p>
                            </div>
                        </div>

                        <div className="divider"></div>

                        <div className="logos-row">
                            <span>AUTHORIZATION REQUIRED</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="split-right">
                    <button type="button" className="theme-toggle" onClick={() => setDark(!dark)}>
                        {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>

                    <div className="form-container">
                        <div className="form-header">
                            <div className="shield-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </div>
                            <h2>Admin Portal</h2>
                            <p>Enter your credentials to access the console.</p>
                        </div>

                        {status && <div style={{ color: '#10b981', fontSize: '14px', marginBottom: '16px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px' }}>{status}</div>}
                        
                        {!status && errors.email && (
                            <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
                                {errors.email}
                            </div>
                        )}

                        <form onSubmit={submit}>

                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Administrator Email</label>
                                <div className="input-wrap">
                                    <span className="input-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    </span>
                                    <input type="email" id="email" className="form-input" placeholder="admin@example.com" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password">Secret Key</label>
                                <div className="input-wrap">
                                    <span className="input-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    </span>
                                    <input type={showPassword ? "text" : "password"} id="password" className="form-input" placeholder="••••••••" value={data.password} onChange={e => setData('password', e.target.value)} required />
                                </div>
                            </div>

                            <div className="remember-row">
                                <label className="remember-label">
                                    <input type="checkbox" name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                                    Keep me signed in
                                </label>
                            </div>

                            <button type="submit" className={`btn-submit ${processing ? 'loading' : ''}`} disabled={processing}>
                                {processing ? 'Authenticating...' : 'Secure Login →'}
                            </button>

                            <div className="form-footer">
                                <Link href="/">← Return to Public Site</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
