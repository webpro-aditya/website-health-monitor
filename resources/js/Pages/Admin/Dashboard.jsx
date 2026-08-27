import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

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

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem('whm-theme', newDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newDark ? 'dark' : 'light');
  };

  return (
    <>
      <Head title="Admin Dashboard" />
      <style dangerouslySetInnerHTML={{
        __html: `
:root{
  --bg:linear-gradient(135deg,#0f0c29,#1a1a3e,#0d1b2a);
  --surface:rgba(255,255,255,.04);--border:rgba(255,255,255,.08);
  --text:#e2e8f0;--sub:#64748b;--label:#94a3b8;
  --hover:rgba(99,102,241,.08);
  --ibg:rgba(255,255,255,.06);--iborder:rgba(255,255,255,.1);--icolor:#e2e8f0;--iph:#475569;
  --alt:rgba(255,255,255,.01);--toff:#374151;
  --cbg:rgba(255,255,255,.03);--cborder:rgba(255,255,255,.07);
}
[data-theme="light"]{
  --bg:linear-gradient(135deg,#f0f4ff,#e8f0fe,#f5f0ff);
  --surface:rgba(255,255,255,.9);--border:rgba(99,102,241,.15);
  --text:#1e293b;--sub:#64748b;--label:#475569;
  --hover:rgba(99,102,241,.06);
  --ibg:#fff;--iborder:#cbd5e1;--icolor:#1e293b;--iph:#94a3b8;
  --alt:rgba(99,102,241,.02);--toff:#cbd5e1;
  --cbg:rgba(255,255,255,.75);--cborder:rgba(99,102,241,.12);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);min-height:100vh;color:var(--text);transition:background .35s,color .3s;}
.wrap{max-width:1000px;margin:0 auto;padding:32px 20px;}

/* HEADER */
.header{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:36px;}
.logo-row{display:flex;align-items:center;gap:12px;margin-bottom:6px;}
.logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#ef4444,#dc2626);display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 20px rgba(239,68,68,.45);flex-shrink:0;}
.htitle{font-size:clamp(18px,4vw,28px);font-weight:800;background:linear-gradient(90deg,#fca5a5,#fecdd3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
[data-theme="light"] .htitle{background:linear-gradient(90deg,#dc2626,#be123c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.hsub{font-size:13px;color:var(--sub);}
.btn-group{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.btn{padding:9px 18px;border:none;border-radius:11px;color:#fff;font-weight:600;font-size:13px;cursor:pointer;transition:transform .15s,filter .15s;white-space:nowrap;}
.btn:hover{transform:translateY(-2px);filter:brightness(1.12);}
.btn:disabled{opacity:0.6;cursor:not-allowed;}

/* User Info */
.user-info{display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:6px 14px 6px 6px;}
.user-avatar{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#ef4444,#dc2626);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;}
.user-name{font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;}
.bi{background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 0 14px rgba(99,102,241,.45);}
.bg{background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 0 14px rgba(16,185,129,.4);}
.bmode{background:var(--surface);border:1px solid var(--border);color:var(--text);padding:9px 16px;border-radius:11px;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;transition:all .2s;white-space:nowrap;display:flex;align-items:center;gap:6px;}
.bmode:hover{transform:translateY(-2px);border-color:rgba(99,102,241,.4);}
.bmode svg{width:14px;height:14px;}

/* GLASS */
.glass{background:var(--surface);border:1px solid var(--border);border-radius:18px;backdrop-filter:blur(14px);}
.panel{padding:26px;}

/* TOGGLE */
.toggle{width:46px;height:25px;border-radius:13px;border:none;cursor:pointer;position:relative;transition:background .3s;flex-shrink:0;}
.toggle.on{background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 0 10px rgba(99,102,241,.5);}
.toggle.off{background:var(--toff);}
.knob{position:absolute;top:3px;width:19px;height:19px;border-radius:50%;background:#fff;transition:left .22s cubic-bezier(.4,0,.2,1);box-shadow:0 1px 4px rgba(0,0,0,.25);}
.toggle.on .knob{left:24px;}
.toggle.off .knob{left:3px;}

/* CONFIG LAYOUT */
.cc{background:var(--cbg);border:1px solid var(--cborder);border-radius:13px;padding:20px;margin-bottom:20px;}
.cc:last-child{margin-bottom:0;}
.ch{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
.cn{display:flex;align-items:center;gap:12px;}
.ci{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;}
.ctitle{font-weight:700;font-size:16px;color:var(--text);}
.config-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;}
.config-group{display:flex;flex-direction:column;gap:8px;}
.config-label{font-size:12px;font-weight:600;color:var(--label);text-transform:uppercase;letter-spacing:.5px;}
.inp-ch{width:100%;background:var(--ibg);border:1px solid var(--iborder);border-radius:10px;padding:10px 14px;color:var(--icolor);font-size:14px;outline:none;font-family:inherit;transition:border-color .2s;}
.inp-ch:focus{border-color:rgba(99,102,241,.6);}
.inp-ch::placeholder{color:var(--iph);}

.footer{text-align:center;margin-top:40px;padding-bottom:20px;font-size:13px;color:var(--sub);}

@media(max-width:768px){.config-grid{grid-template-columns:1fr;}}
`}} />
      <div className="admin-dashboard-wrapper" data-theme={dark ? 'dark' : 'light'}>

        <div className="wrap">
          <div className="header">
            <div>
              <div className="logo-row">
                <div className="logo">⚙️</div>
                <div className="htitle">Admin Control</div>
              </div>
              <div className="hsub">Manage global notification gateways and system settings.</div>
            </div>
            <div className="btn-group">
              <div className="user-info"><span className="user-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</span><span className="user-name">{user?.name || 'Admin'}</span></div>
              <button className="bmode" id="mbtn" onClick={toggleTheme}>
                {dark ? (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg> Light Mode</>
                ) : (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg> Dark Mode</>
                )}
              </button>
              <a href={route("admin.logout.get")} className="btn" style={{ background: 'linear-gradient(135deg,#64748b,#475569)', boxShadow: '0 0 14px rgba(100,116,139,.4)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>🚪 Logout</a>
            </div>
          </div>

          <div className="glass panel">
            <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '700' }}>Global Notification Channels</h2>

            {/*  Email Configuration  */}
            <form className="cc" onSubmit={(e) => { e.preventDefault(); emailForm.post(route('admin.config.email')); }}>
              <div className="ch">
                <div className="cn">
                  <div className="ci" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 12px rgba(99,102,241,.3)' }}>📧</div>
                  <div className="ctitle">SMTP Email Gateway</div>
                </div>
                <button type="button" className={`toggle ${emailForm.data.is_active ? 'on' : 'off'}`} onClick={() => emailForm.setData('is_active', !emailForm.data.is_active)}><span className="knob"></span></button>
              </div>
              <div className="config-grid">
                <div className="config-group">
                  <label className="config-label">SMTP Host</label>
                  <input className="inp-ch" type="text" placeholder="smtp.hostinger.com" value={emailForm.data.smtp_host} onChange={e => emailForm.setData('smtp_host', e.target.value)} />
                </div>
                <div className="config-group">
                  <label className="config-label">SMTP Port</label>
                  <input className="inp-ch" type="text" placeholder="587" value={emailForm.data.smtp_port} onChange={e => emailForm.setData('smtp_port', e.target.value)} />
                </div>
                <div className="config-group">
                  <label className="config-label">SMTP Username</label>
                  <input className="inp-ch" type="text" placeholder="info@ensdevops.com" value={emailForm.data.smtp_username} onChange={e => emailForm.setData('smtp_username', e.target.value)} />
                </div>
                <div className="config-group">
                  <label className="config-label">SMTP Password</label>
                  <input className="inp-ch" type="password" placeholder="••••••••" value={emailForm.data.smtp_password} onChange={e => emailForm.setData('smtp_password', e.target.value)} />
                </div>
                <div className="config-group">
                  <label className="config-label">From Email</label>
                  <input className="inp-ch" type="text" placeholder="info@ensdevops.com" value={emailForm.data.from_email} onChange={e => emailForm.setData('from_email', e.target.value)} />
                </div>
                <div className="config-group">
                  <label className="config-label">From Name</label>
                  <input className="inp-ch" type="text" placeholder="Downtime Alert" value={emailForm.data.from_name} onChange={e => emailForm.setData('from_name', e.target.value)} />
                </div>
                <div className="config-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="config-label">Default BCC/Notification Emails (comma separated)</label>
                  <input className="inp-ch" type="text" placeholder="admin@domain.com, alerts@domain.com" value={emailForm.data.notification_emails} onChange={e => emailForm.setData('notification_emails', e.target.value)} />
                </div>
                <div className="config-group" style={{ gridColumn: '1 / -1', alignItems: 'flex-end', marginTop: '8px' }}>
                  <button type="submit" className="btn bi" style={{ padding: '12px 24px' }} disabled={emailForm.processing}>{emailForm.processing ? '💾 Saving...' : '💾 Save SMTP Settings'}</button>
                </div>
              </div>
            </form>

            {/*  SMS Configuration  */}
            <form className="cc" onSubmit={(e) => { e.preventDefault(); smsForm.post(route('admin.config.sms')); }}>
              <div className="ch">
                <div className="cn">
                  <div className="ci" style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', boxShadow: '0 0 12px rgba(37,211,102,.3)' }}>📱</div>
                  <div className="ctitle">SMS Gateway</div>
                </div>
                <button type="button" className={`toggle ${smsForm.data.is_active ? 'on' : 'off'}`} onClick={() => smsForm.setData('is_active', !smsForm.data.is_active)}><span className="knob"></span></button>
              </div>
              <div className="config-grid">
                <div className="config-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="config-label">SMS Gateway URL / API Endpoint</label>
                  <input className="inp-ch" type="text" placeholder="https://api.sms-provider.com/send" value={smsForm.data.api_endpoint} onChange={e => smsForm.setData('api_endpoint', e.target.value)} />
                </div>
                <div className="config-group">
                  <label className="config-label">API Key / Token</label>
                  <input className="inp-ch" type="password" placeholder="Your API Key" value={smsForm.data.api_key} onChange={e => smsForm.setData('api_key', e.target.value)} />
                </div>
                <div className="config-group">
                  <label className="config-label">Sender ID</label>
                  <input className="inp-ch" type="text" placeholder="ENS-ALERT" value={smsForm.data.sender_id} onChange={e => smsForm.setData('sender_id', e.target.value)} />
                </div>
                <div className="config-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="config-label">Default Notification Numbers (comma separated)</label>
                  <input className="inp-ch" type="text" placeholder="+919876543210" value={smsForm.data.notification_numbers} onChange={e => smsForm.setData('notification_numbers', e.target.value)} />
                </div>
                <div className="config-group" style={{ gridColumn: '1 / -1', alignItems: 'flex-end', marginTop: '8px' }}>
                  <button type="submit" className="btn bg" style={{ padding: '12px 24px' }} disabled={smsForm.processing}>{smsForm.processing ? '💾 Saving...' : '💾 Save SMS Settings'}</button>
                </div>
              </div>
            </form>
          </div>

          <div className="footer">Website Health Monitor &mdash; Administrator Dashboard</div>
        </div>
      </div>
    </>
  );
}
