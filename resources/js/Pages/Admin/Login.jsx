import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';


import { useState, useEffect } from 'react';
export default function AdminLogin({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

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
  --bg:linear-gradient(135deg,#0f0c29,#1a1a3e,#0d1b2a);
  --surface:rgba(255,255,255,.04);--border:rgba(255,255,255,.08);
  --text:#e2e8f0;--sub:#94a3b8;--label:#94a3b8;
  --ibg:rgba(255,255,255,.06);--iborder:rgba(255,255,255,.1);--icolor:#e2e8f0;--iph:#64748b;
  --card-bg:rgba(255,255,255,.03);--card-border:rgba(255,255,255,.07);
  --error-bg:rgba(239,68,68,.12);--error-text:#fca5a5;--error-border:rgba(239,68,68,.25);
}
[data-theme="light"]{
  --bg:linear-gradient(135deg,#f8fafc,#e2e8f0,#f1f5f9);
  --surface:rgba(255,255,255,.9);--border:rgba(99,102,241,.15);
  --text:#1e293b;--sub:#64748b;--label:#475569;
  --ibg:#fff;--iborder:#cbd5e1;--icolor:#1e293b;--iph:#94a3b8;
  --card-bg:rgba(255,255,255,.85);--card-border:rgba(99,102,241,.12);
  --error-bg:rgba(239,68,68,.08);--error-text:#dc2626;--error-border:rgba(239,68,68,.2);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{
  font-family:'Inter',system-ui,sans-serif;
  background:var(--bg);
  min-height:100vh;
  color:var(--text);
  transition:background .35s,color .3s;
}

#app {
  width: 100% !important;
  min-height: 100vh;
}

/* Animated background orbs */
.orb{
  position:fixed;
  border-radius:50%;
  filter:blur(100px);
  opacity:.3;
  animation:float 8s ease-in-out infinite;
  pointer-events:none;
  z-index:0;
}
.orb-1{width:500px;height:500px;background:#6366f1;top:-150px;left:-150px;animation-delay:0s;}
.orb-2{width:400px;height:400px;background:#a855f7;bottom:-100px;right:-100px;animation-delay:-3s;}
.orb-3{width:300px;height:300px;background:#3b82f6;top:40%;left:50%;animation-delay:-5s;}
@keyframes float{
  0%,100%{transform:translate(0,0) scale(1);}
  33%{transform:translate(30px,-30px) scale(1.05);}
  66%{transform:translate(-20px,20px) scale(.95);}
}

.login-page-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Login Card */
.login-container{
  position:relative;
  z-index:1;
  width:100%;
  max-width:540px;
  animation:slideUp .5s ease-out;
}
@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}

.login-card{
  background:var(--card-bg);
  border:1px solid var(--card-border);
  border-radius:24px;
  backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);
  padding:48px 56px;
  box-shadow:0 25px 60px rgba(0,0,0,.3);
}

/* Logo */
.logo-section{text-align:center;margin-bottom:36px;}
.logo-icon{
  width:72px;height:72px;
  border-radius:20px;
  background:linear-gradient(135deg,#6366f1,#a855f7);
  display:inline-flex;align-items:center;justify-content:center;
  font-size:36px;
  box-shadow:0 0 30px rgba(99,102,241,.5);
  margin-bottom:20px;
}
.logo-title{
  font-size:26px;font-weight:800;
  background:linear-gradient(90deg,#a5b4fc,#f0abfc);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  margin-bottom: 8px;
}
[data-theme="light"] .logo-title{
  background:linear-gradient(90deg,#4f46e5,#9333ea);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.logo-sub{font-size:14px;color:var(--sub);}

/* Error Alert */
.error-alert{
  background:var(--error-bg);
  border:1px solid var(--error-border);
  border-radius:12px;
  padding:14px 18px;
  margin-bottom:24px;
  display:flex;align-items:center;gap:12px;
  font-size:14px;font-weight:500;color:var(--error-text);
  animation:shake .4s ease;
}
@keyframes shake{
  0%,100%{transform:translateX(0)}
  20%{transform:translateX(-8px)}
  40%{transform:translateX(8px)}
  60%{transform:translateX(-4px)}
  80%{transform:translateX(4px)}
}
.error-icon{font-size:20px;flex-shrink:0;}

/* Form */
.form-group{margin-bottom:24px;}
.form-label{
  display:block;
  font-size:13px;font-weight:600;
  color:var(--label);
  text-transform:uppercase;letter-spacing:1px;
  margin-bottom:10px;
}
.input-wrap{position:relative;}
.input-icon{
  position:absolute;left:16px;top:50%;transform:translateY(-50%);
  font-size:18px;color:var(--iph);
  pointer-events:none;
  transition:color .2s;
}
.form-input{
  width:100%;
  background:var(--ibg);
  border:1px solid var(--iborder);
  border-radius:14px;
  padding:15px 16px 15px 48px;
  color:var(--icolor);
  font-size:15px;
  outline:none;
  font-family:inherit;
  transition:border-color .2s,box-shadow .2s;
}
.form-input:focus{
  border-color:rgba(99,102,241,.6);
  box-shadow:0 0 0 4px rgba(99,102,241,.12);
}
.form-input:focus + .input-icon-right,
.form-input:focus ~ .input-icon{color:#818cf8;}
.form-input::placeholder{color:var(--iph);}

/* Password toggle */
.pass-toggle{
  position:absolute;right:16px;top:50%;transform:translateY(-50%);
  background:none;border:none;color:var(--sub);
  cursor:pointer;font-size:18px;padding:4px;
  transition:color .2s;
}
.pass-toggle svg{stroke:currentColor;transition:stroke .2s;}
.pass-toggle:hover{color:#818cf8;}
.pass-toggle:hover svg{stroke:#818cf8;}

/* Options row */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  font-size: 13px;
}
.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--sub);
  cursor: pointer;
}
.remember-me input {
  accent-color: #6366f1;
  width: 16px;
  height: 16px;
}
.forgot-pass {
  color: #818cf8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}
.forgot-pass:hover { color: #a5b4fc; }

/* Submit */
.btn-login{
  width:100%;
  padding:16px 24px;
  border:none;border-radius:14px;
  background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#6366f1 100%);
  background-size:200% 100%;
  color:#fff;
  font-size:16px;font-weight:700;
  font-family:inherit;
  cursor:pointer;
  transition:transform .2s ease,box-shadow .2s ease,background-position .4s ease;
  box-shadow:0 4px 15px rgba(99,102,241,.4),0 0 0 0 rgba(99,102,241,0);
  position:relative;
  overflow:hidden;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  letter-spacing:.3px;
}
.btn-login::before{
  content:'';
  position:absolute;
  top:0;left:-100%;
  width:100%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
  transition:none;
}
.btn-login:hover{
  transform:translateY(-3px);
  box-shadow:0 8px 25px rgba(99,102,241,.5),0 0 40px rgba(139,92,246,.2);
  background-position:100% 0;
}
.btn-login:hover::before{
  left:100%;
  transition:left .6s ease;
}
.btn-login:active{
  transform:translateY(-1px);
  box-shadow:0 2px 10px rgba(99,102,241,.4);
}

/* Loading state */
.btn-login.loading{pointer-events:none;opacity:.75;}
.btn-login.loading::after{
  content:'';position:absolute;
  width:22px;height:22px;
  border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;
  border-radius:50%;
  animation:spin .6s linear infinite;
  right:20px;top:50%;margin-top:-11px;
}
@keyframes spin{to{transform:rotate(360deg)}}

/* Extras */
.login-footer{
  text-align:center;margin-top:32px;
  font-size:14px;color:var(--sub);
}
.login-footer a{
  color:#818cf8;text-decoration:none;font-weight:600;
  transition:color .2s;
}
.login-footer a:hover{color:#a5b4fc;}

/* Theme toggle */
.theme-toggle{
  position:fixed;top:20px;right:20px;z-index:10;
  background:var(--surface);border:1px solid var(--border);
  border-radius:12px;padding:10px 16px;
  color:var(--text);font-size:13px;font-weight:600;
  font-family:inherit;cursor:pointer;
  transition:all .2s;backdrop-filter:blur(10px);
  display: flex;
  align-items: center;
  gap: 8px;
}
.theme-toggle:hover{transform:translateY(-2px);border-color:rgba(99,102,241,.4);}

/* Responsive */
@media(max-width:480px){
  .login-card{padding:32px 24px;border-radius:20px;}
  .logo-title{font-size:22px;}
}
`}} />
            <div className="login-page-wrapper" data-theme={dark ? 'dark' : 'light'}>
{/*  Background orbs  */}
<div className="orb orb-1"></div>
<div className="orb orb-2"></div>
<div className="orb orb-3"></div>

{/*  Theme Toggle  */}
<button className="theme-toggle" id="theme-btn" onClick={() => setDark(!dark)}>
    <span id="theme-icon">
      {dark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      )}
    </span> {dark ? 'Dark Mode' : 'Light Mode'}
</button>

<div className="login-container">
  <div className="login-card">
    
    {/*  Logo  */}
    <div className="logo-section">
      <div className="logo-icon">🛡️</div>
      <div className="logo-title">Admin</div>
      <div className="logo-sub">Sign in to your administrator dashboard</div>
    </div>

    {/*  Error  */}
    {status && (
      <div className="error-alert" role="alert">
        <span className="error-icon">⚠️</span>
        <span>{status}</span>
      </div>
    )}
    {!status && errors.email && (
      <div className="error-alert" role="alert">
        <span className="error-icon">⚠️</span>
        <span>{errors.email}</span>
      </div>
    )}

    {/*  Login Form  */}
    <form onSubmit={submit}>
      
      <div className="form-group">
        <label className="form-label" htmlFor="email">Email Address</label>
        <div className="input-wrap">
          <input type="email" name="email" id="email" className="form-input" placeholder="Enter your email" required value={data.email} onChange={(e) => setData('email', e.target.value)} />
          <InputError message={errors.email} className="mt-2" />
          <span className="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" htmlFor="password">Password</label>
        <div className="input-wrap">
          <input type={showPassword ? "text" : "password"} name="password" id="password" className="form-input" placeholder="Enter your password" required value={data.password} onChange={(e) => setData('password', e.target.value)} />
          <InputError message={errors.password} className="mt-2" />
          <span className="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
          <button type="button" className="pass-toggle" onClick={() => setShowPassword(!showPassword)} title="Show password" aria-label="Toggle password visibility">
            <span id="pass-icon">
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </span>
          </button>
        </div>
      </div>

      <div className="form-options">
        <label className="remember-me">
          <input type="checkbox" name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
          Remember me
        </label>
      </div>

      <button type="submit" className={`btn-login ${processing ? 'loading' : ''}`} id="btn-submit" disabled={processing}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
        <span>Sign In</span>
      </button>
    </form>

    <div className="login-footer">
      <a href="/">←  Back to Homepage</a>
    </div>
  </div>
</div>
            </div>
        </>
    );
}
