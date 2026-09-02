import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

const Icon = ({ children, size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>
);
const IconShield = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Icon>;
const IconMoon = (p) => <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></Icon>;
const IconSun = (p) => <Icon {...p}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></Icon>;
const IconLogOut = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>;
const IconUsers = (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>;
const IconGlobe = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></Icon>;
const IconMail = (p) => <Icon {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></Icon>;
const IconMessageSquare = (p) => <Icon {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icon>;

function Toggle({ checked, onChange }) {
  return (
    <button className="whm-toggle" data-on={checked} onClick={onChange} type="button">
      <span className="whm-toggle-knob" />
    </button>
  );
}

export default function AdminDashboard({ totalUsers, totalDomains, users, emailConfig, smsConfig }) {
  const { auth } = usePage().props;
  const user = auth.user;

  const emailForm = useForm({
    smtp_host: emailConfig?.smtp_host || '',
    smtp_port: emailConfig?.smtp_port || '',
    smtp_username: emailConfig?.smtp_username || '',
    smtp_password: emailConfig?.smtp_password || '',
    from_email: emailConfig?.from_email || '',
    from_name: emailConfig?.from_name || '',
    notification_emails: emailConfig?.notification_emails || '',
    is_active: emailConfig?.is_active == 1
  });

  const smsForm = useForm({
    api_endpoint: smsConfig?.api_endpoint || '',
    api_key: smsConfig?.api_key || '',
    sender_id: smsConfig?.sender_id || '',
    notification_numbers: smsConfig?.notification_numbers || '',
    is_active: smsConfig?.is_active == 1
  });

  const [dark, setDark] = React.useState(true);

  React.useEffect(() => {
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

  const css = `
:root {
  --bg-primary: #0f0c29;
  --bg-gradient: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  --bg-secondary: rgba(255, 255, 255, 0.03);
  --surface: rgba(255, 255, 255, 0.05);
  --surface-hover: rgba(255, 255, 255, 0.08);
  --border: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(99, 102, 241, 0.4);
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  --accent: #06b6d4;
  --accent-glow: rgba(6, 182, 212, 0.4);
  --accent-secondary: #8b5cf6;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --radius-lg: 24px;
  --radius-md: 16px;
  --radius-sm: 8px;
}

[data-theme="light"] {
  --bg-primary: #f4f7fb;
  --bg-gradient: linear-gradient(135deg, #f4f7fb, #e0e7ff, #f8fafc);
  --bg-secondary: #ffffff;
  --surface: #ffffff;
  --surface-hover: #f8fafc;
  --border: rgba(99, 102, 241, 0.15);
  --border-hover: rgba(99, 102, 241, 0.4);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  --accent: #0284c7;
  --accent-glow: rgba(2, 132, 199, 0.2);
  --accent-secondary: #4f46e5;
}

* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; }
body { background: var(--bg-gradient); color: var(--text-primary); min-height: 100vh; overflow-x: hidden; transition: all 0.3s ease; }

.whm-container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; display: flex; flex-direction: column; gap: 32px; }

/* HEADER */
.whm-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
.whm-header-left { display: flex; align-items: center; gap: 16px; }
.whm-logo { width: 48px; height: 48px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--accent), var(--accent-secondary)); display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 0 20px var(--accent-glow); }
.whm-brand { font-size: 24px; font-weight: 800; background: linear-gradient(to right, var(--accent), var(--accent-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.whm-tagline { font-size: 13px; color: var(--text-tertiary); display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.whm-live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); box-shadow: 0 0 8px var(--success); }

.whm-header-actions { display: flex; align-items: center; gap: 12px; }
.whm-user-chip { display: flex; align-items: center; gap: 8px; padding: 6px 14px 6px 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 30px; }
.whm-user-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-secondary)); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; }
.whm-user-name { font-size: 13px; font-weight: 600; }

.whm-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; text-decoration: none; }
.whm-btn-icon { padding: 10px; background: var(--surface); border: 1px solid var(--border); color: var(--text-primary); border-radius: 50%; }
.whm-btn-icon:hover { background: var(--surface-hover); transform: translateY(-2px); }
.whm-btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent-secondary)); color: white; box-shadow: 0 4px 14px var(--accent-glow); }
.whm-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px var(--accent-glow); }
.whm-btn-ghost-muted { background: transparent; color: var(--text-tertiary); }
.whm-btn-ghost-muted:hover { color: var(--danger); background: rgba(239, 68, 68, 0.1); }

/* STATS */
.whm-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.whm-stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; position: relative; overflow: hidden; backdrop-filter: blur(10px); display: flex; flex-direction: column; gap: 12px; transition: transform 0.3s, box-shadow 0.3s; }
.whm-stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.whm-stat-icon { width: 44px; height: 44px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }

/* TABLE */
.whm-table-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); backdrop-filter: blur(10px); overflow: hidden; }
.whm-table-header { padding: 24px; border-bottom: 1px solid var(--border); }
.whm-table-title { font-size: 18px; font-weight: 700; }
.whm-table-wrapper { overflow-x: auto; }
.whm-table { width: 100%; border-collapse: collapse; }
.whm-table th { padding: 16px 24px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.5px; border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.1); }
[data-theme="light"] .whm-table th { background: rgba(0,0,0,0.02); }
.whm-table td { padding: 16px 24px; font-size: 14px; border-bottom: 1px solid var(--border); }
.whm-table tr:last-child td { border-bottom: none; }
.whm-table tr:hover td { background: var(--surface-hover); }

/* BADGES */
.whm-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; }
.whm-badge-admin { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
.whm-badge-trial { background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
.whm-badge-pro { background: rgba(6, 182, 212, 0.15); color: var(--accent); border: 1px solid rgba(6, 182, 212, 0.3); box-shadow: 0 0 10px rgba(6, 182, 212, 0.2); }
.whm-badge-none { background: var(--surface-hover); color: var(--text-secondary); border: 1px solid var(--border); }

/* FORMS */
.whm-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; }
.whm-form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.whm-form-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.whm-form-input { background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-primary); padding: 12px 16px; border-radius: var(--radius-sm); font-size: 14px; outline: none; transition: all 0.2s; width: 100%; }
.whm-form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }

/* TOGGLE */
.whm-toggle { width: 44px; height: 24px; border-radius: 12px; background: rgba(255,255,255,0.1); border: 1px solid var(--border); position: relative; cursor: pointer; transition: all 0.3s; padding: 0; }
[data-theme="light"] .whm-toggle { background: rgba(0,0,0,0.1); }
.whm-toggle[data-on="true"] { background: var(--accent-secondary); border-color: var(--accent-secondary); box-shadow: 0 0 10px rgba(139, 92, 246, 0.4); }
.whm-toggle-knob { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.whm-toggle[data-on="true"] .whm-toggle-knob { left: 22px; }
`;

  return (
    <>
      <Head title="Admin Control" />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="whm-container">
        
        {/* HEADER */}
        <header className="whm-header">
          <div className="whm-header-left">
            <div className="whm-logo">
              <IconShield size={22} />
            </div>
            <div>
              <h1 className="whm-brand">Admin Control</h1>
              <p className="whm-tagline"><span className="whm-live-dot" /> Global Settings & User Management</p>
            </div>
          </div>
          <div className="whm-header-actions">
            <div className="whm-user-chip">
              <div className="whm-user-avatar">{user?.name ? user.name[0].toUpperCase() : 'A'}</div>
              <span className="whm-user-name">{user?.name || 'Admin'}</span>
            </div>
            <button className="whm-btn whm-btn-icon" onClick={() => setDark(!dark)} title={dark ? 'Switch to Light' : 'Switch to Dark'}>
              {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </button>
            <a href={route("admin.logout.get")} className="whm-btn whm-btn-ghost-muted">
              <IconLogOut size={16} /> Logout
            </a>
          </div>
        </header>

        {/* STATS */}
        <div className="whm-stats-grid">
          <div className="whm-stat-card" style={{ borderTop: '2px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="whm-stat-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                <IconUsers size={24} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '800' }}>{totalUsers}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600' }}>TOTAL REGISTERED USERS</div>
            </div>
          </div>
          
          <div className="whm-stat-card" style={{ borderTop: '2px solid var(--accent-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="whm-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-secondary)' }}>
                <IconGlobe size={24} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '800' }}>{totalDomains}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600' }}>MONITORED DOMAINS SYSTEM-WIDE</div>
            </div>
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="whm-table-card">
          <div className="whm-table-header">
            <h2 className="whm-table-title">Registered Users</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Overview of all registered accounts and their subscription status.</p>
          </div>
          <div className="whm-table-wrapper">
            <table className="whm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Subscription</th>
                  <th>Domains</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '600' }}>{u.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className={`whm-badge ${u.role === 'admin' ? 'whm-badge-admin' : 'whm-badge-none'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`whm-badge ${u.plan_name === 'Free Trial' ? 'whm-badge-trial' : (u.plan_name === 'No Plan' ? 'whm-badge-none' : 'whm-badge-pro')}`}>
                        {u.plan_name}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700' }}>{u.domains_count}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CONFIGURATIONS */}
        <div className="whm-grid-2">
          
          {/* Email Settings */}
          <form className="whm-table-card" onSubmit={(e) => { e.preventDefault(); emailForm.post(route('admin.config.email')); }} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="whm-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="whm-table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconMail size={20} color="var(--accent)" /> SMTP Email Gateway</h2>
              </div>
              <Toggle checked={emailForm.data.is_active} onChange={() => emailForm.setData('is_active', !emailForm.data.is_active)} />
            </div>
            <div style={{ padding: '24px', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="whm-form-group">
                  <label className="whm-form-label">SMTP Host</label>
                  <input className="whm-form-input" type="text" value={emailForm.data.smtp_host} onChange={e => emailForm.setData('smtp_host', e.target.value)} />
                </div>
                <div className="whm-form-group">
                  <label className="whm-form-label">SMTP Port</label>
                  <input className="whm-form-input" type="text" value={emailForm.data.smtp_port} onChange={e => emailForm.setData('smtp_port', e.target.value)} />
                </div>
                <div className="whm-form-group">
                  <label className="whm-form-label">Username</label>
                  <input className="whm-form-input" type="text" value={emailForm.data.smtp_username} onChange={e => emailForm.setData('smtp_username', e.target.value)} />
                </div>
                <div className="whm-form-group">
                  <label className="whm-form-label">Password</label>
                  <input className="whm-form-input" type="password" value={emailForm.data.smtp_password} onChange={e => emailForm.setData('smtp_password', e.target.value)} />
                </div>
                <div className="whm-form-group">
                  <label className="whm-form-label">From Email</label>
                  <input className="whm-form-input" type="text" value={emailForm.data.from_email} onChange={e => emailForm.setData('from_email', e.target.value)} />
                </div>
                <div className="whm-form-group">
                  <label className="whm-form-label">From Name</label>
                  <input className="whm-form-input" type="text" value={emailForm.data.from_name} onChange={e => emailForm.setData('from_name', e.target.value)} />
                </div>
                <div className="whm-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="whm-form-label">Default BCC / Notification Emails</label>
                  <input className="whm-form-input" type="text" value={emailForm.data.notification_emails} onChange={e => emailForm.setData('notification_emails', e.target.value)} />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', textAlign: 'right' }}>
              <button type="submit" className="whm-btn whm-btn-primary" disabled={emailForm.processing}>{emailForm.processing ? 'Saving...' : 'Save Settings'}</button>
            </div>
          </form>

          {/* SMS Settings */}
          <form className="whm-table-card" onSubmit={(e) => { e.preventDefault(); smsForm.post(route('admin.config.sms')); }} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="whm-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="whm-table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconMessageSquare size={20} color="var(--accent-secondary)" /> SMS Gateway</h2>
              </div>
              <Toggle checked={smsForm.data.is_active} onChange={() => smsForm.setData('is_active', !smsForm.data.is_active)} />
            </div>
            <div style={{ padding: '24px', flex: 1 }}>
              <div className="whm-form-group">
                <label className="whm-form-label">Gateway API Endpoint</label>
                <input className="whm-form-input" type="text" value={smsForm.data.api_endpoint} onChange={e => smsForm.setData('api_endpoint', e.target.value)} />
              </div>
              <div className="whm-form-group">
                <label className="whm-form-label">API Key / Token</label>
                <input className="whm-form-input" type="password" value={smsForm.data.api_key} onChange={e => smsForm.setData('api_key', e.target.value)} />
              </div>
              <div className="whm-form-group">
                <label className="whm-form-label">Sender ID</label>
                <input className="whm-form-input" type="text" value={smsForm.data.sender_id} onChange={e => smsForm.setData('sender_id', e.target.value)} />
              </div>
              <div className="whm-form-group">
                <label className="whm-form-label">Default Notification Numbers</label>
                <input className="whm-form-input" type="text" value={smsForm.data.notification_numbers} onChange={e => smsForm.setData('notification_numbers', e.target.value)} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', textAlign: 'right' }}>
              <button type="submit" className="whm-btn whm-btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-secondary), #6d28d9)' }} disabled={smsForm.processing}>{smsForm.processing ? 'Saving...' : 'Save Settings'}</button>
            </div>
          </form>

        </div>

      </div>
    </>
  );
}
