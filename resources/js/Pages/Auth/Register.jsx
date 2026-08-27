import { useState, useEffect } from 'react';
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function Register() {
    
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

    const [billingCycle, setBillingCycle] = useState('monthly');
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        plan: 'pro_monthly',
    });
    
    // Keep plan sync with billing cycle
    useEffect(() => {
        if (data.plan) {
            const base = data.plan.split('_')[0];
            setData('plan', base + '_' + billingCycle);
        }
    }, [billingCycle]);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <>
            <Head title="Register" />
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

/* Card */
.login-container{
  position:relative;
  z-index:1;
  width:100%;
  max-width:600px;
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


/* Plan Selector */
.plan-toggle {
  display: flex;
  background: var(--ibg);
  border-radius: var(--radius-md);
  padding: 4px;
  width: max-content;
  margin: 0 auto 20px;
  border: 1px solid var(--iborder);
}
.plan-toggle button {
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--sub);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.plan-toggle button.active {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.plan-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
.plan-card {
  border: 1px solid var(--iborder);
  background: var(--ibg);
  border-radius: var(--radius-md);
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}
.plan-card:hover {
  border-color: rgba(99,102,241,0.5);
  transform: translateY(-2px);
}
.plan-card.active {
  border-color: #6366f1;
  background: rgba(99,102,241,0.05);
  box-shadow: 0 0 0 1px #6366f1, 0 4px 12px rgba(99,102,241,0.15);
}
.plan-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}
.plan-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}
.plan-price span {
  font-size: 11px;
  font-weight: 400;
  color: var(--sub);
}
.plan-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #10b981;
  color: #fff;
  font-size: 9px;
  padding: 2px 8px;
  border-bottom-left-radius: 8px;
  font-weight: bold;
}
@media(max-width:480px){
  .plan-grid { grid-template-columns: 1fr; }
}

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
      <div className="logo-title">Create Account</div>
      <div className="logo-sub">Create your account to get started</div>
    </div>

    {/*  Error  */}
    {hasErrors && (
      <div className="error-alert" role="alert">
        <span className="error-icon">⚠️</span>
        <span>{errors.name || errors.email || errors.password || errors.password_confirmation}</span>
      </div>
    )}

    {/*  Register Form  */}
    <form onSubmit={submit}>

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <label className="form-label" style={{ marginBottom: '12px', display: 'block', fontSize: '15px' }}>Choose a Plan</label>
            <div className="plan-toggle">
                <button type="button" className={billingCycle === 'monthly' ? 'active' : ''} onClick={() => setBillingCycle('monthly')}>Monthly</button>
                <button type="button" className={billingCycle === 'yearly' ? 'active' : ''} onClick={() => setBillingCycle('yearly')}>Yearly (Save 20%)</button>
            </div>
        </div>
        <div className="plan-grid">
            {[
                { id: 'starter', name: 'Starter', priceMonthly: '$9', priceYearly: '$90' },
                { id: 'pro', name: 'Pro', priceMonthly: '$29', priceYearly: '$290', badge: 'POPULAR' },
                { id: 'enterprise', name: 'Enterprise', priceMonthly: '$99', priceYearly: '$990' }
            ].map(p => {
                const planId = p.id + '_' + billingCycle;
                const isActive = data.plan === planId;
                return (
                    <div key={p.id} className={`plan-card ${isActive ? 'active' : ''}`} onClick={() => setData('plan', planId)}>
                        {p.badge && <div className="plan-badge">{p.badge}</div>}
                        <div className="plan-name">{p.name}</div>
                        <div className="plan-price">
                            {billingCycle === 'monthly' ? p.priceMonthly : p.priceYearly}<span>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="name">Full Name</label>
        <div className="input-wrap">
          <input type="text" name="name" id="name" className="form-input" placeholder="Enter your full name" required value={data.name} onChange={(e) => setData('name', e.target.value)} />
          <InputError message={errors.name} className="mt-2" />
          <span className="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="email">Email Address</label>
        <div className="input-wrap">
          <input type="email" name="email" id="email" className="form-input" placeholder="Enter your email address" required value={data.email} onChange={(e) => setData('email', e.target.value)} />
          <InputError message={errors.email} className="mt-2" />
          <span className="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">Password</label>
        <div className="input-wrap">
          <input type={showPassword ? "text" : "password"} name="password" id="password" className="form-input" placeholder="Create a strong password" required value={data.password} onChange={(e) => setData('password', e.target.value)} />
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

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" htmlFor="password_confirmation">Confirm Password</label>
        <div className="input-wrap">
          <input type={showPassword ? "text" : "password"} name="password_confirmation" id="password_confirmation" className="form-input" placeholder="Confirm your password" required value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
          <InputError message={errors.password_confirmation} className="mt-2" />
          <span className="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
        </div>
      </div>

      <button type="submit" className={`btn-login ${processing ? 'loading' : ''}`} id="btn-submit" disabled={processing}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        <span>Create Account</span>
      </button>
    </form>

    <div className="login-footer">
      Already have an account? <Link href={route('login')}>Sign In</Link>
      <br /><br />
      <Link href="/">←  Back to Homepage</Link>
    </div>
  </div>
</div>

            </div>
        </>
    );
}
