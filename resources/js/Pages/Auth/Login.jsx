import { useState, useEffect } from 'react';
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function Login({ status, canResetPassword }) {
    
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
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />
            <style dangerouslySetInnerHTML={{__html: `
:root{
  --c-bg: #ffffff;
  --c-text: #0f172a;
  --c-sub: #64748b;
  --c-border: #e2e8f0;
  --c-input-bg: #ffffff;
  --c-card-bg: #f8fafc;
  --c-accent: #4f46e5;
  --c-accent-hover: #4338ca;
}
[data-theme="dark"]{
  --c-bg: #0f172a;
  --c-text: #f8fafc;
  --c-sub: #94a3b8;
  --c-border: #334155;
  --c-input-bg: #0f172a;
  --c-card-bg: #1e293b;
  --c-accent: #6366f1;
  --c-accent-hover: #4f46e5;
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

/* Left Panel */
.split-left {
  flex: 0 0 45%;
  background: linear-gradient(135deg, #1e1b4b, #312e81);
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
  background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
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
  margin-bottom: 48px;
}
.stats-row {
  display: flex;
  gap: 32px;
  margin-bottom: 48px;
}
.stat-item h3 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}
.stat-item p {
  font-size: 14px;
  color: #cbd5e1;
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
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
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
  color: var(--c-accent);
  margin-bottom: 16px;
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
  margin-bottom: 16px;
}
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 6px;
}
.form-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--c-input-bg);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  color: var(--c-text);
  font-size: 14px;
  outline: none;
  transition: border 0.2s;
}
.form-input:focus {
  border-color: var(--c-accent);
}
.btn-submit {
  width: 100%;
  padding: 12px;
  background: var(--c-accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: background 0.2s;
}
.btn-submit:hover {
  background: var(--c-accent-hover);
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
  margin-bottom: 16px;
  font-size: 13px;
}
.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--c-sub);
  cursor: pointer;
}
.forgot-link {
  color: var(--c-accent);
  text-decoration: none;
}
.forgot-link:hover {
  text-decoration: underline;
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
                        <h1 className="left-title">Trusted by 10,000+ Teams Worldwide.</h1>
                        
                        <div className="stats-row">
                            <div className="stat-item">
                                <h3>99.9%</h3>
                                <p>Uptime SLA</p>
                            </div>
                            <div className="stat-item">
                                <h3>150ms</h3>
                                <p>Avg Response</p>
                            </div>
                            <div className="stat-item">
                                <h3>24/7</h3>
                                <p>Monitoring</p>
                            </div>
                        </div>

                        <div className="divider"></div>

                        <div className="logos-row">
                            <span>NEXUS</span>
                            <span>LUMINA</span>
                            <span>SYNAPSE</span>
                            <span>AURA</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="split-right">
                    <button type="button" className="theme-toggle" onClick={() => setDark(!dark)}>
                        {dark ? '☀️ Light' : '🌙 Dark'}
                    </button>

                    <div className="form-container">
                        <div className="form-header">
                            <div className="shield-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </div>
                            <h2>Welcome Back</h2>
                            <p>Sign in to your account to continue.</p>
                        </div>

                        {status && <div style={{ color: '#10b981', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{status}</div>}

                        <form onSubmit={submit}>

                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Email Address</label>
                                <input type="email" id="email" className="form-input" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password">Password</label>
                                <input type="password" id="password" className="form-input" value={data.password} onChange={e => setData('password', e.target.value)} required />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="remember-row">
                                <label className="remember-label">
                                    <input type="checkbox" name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                                    Remember me
                                </label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="forgot-link">
                                        Forgot your password?
                                    </Link>
                                )}
                            </div>

                            <button type="submit" className="btn-submit" disabled={processing}>
                                Sign In →
                            </button>

                            <div className="form-footer">
                                Don't have an account? <Link href={route('register')}>Create one</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
