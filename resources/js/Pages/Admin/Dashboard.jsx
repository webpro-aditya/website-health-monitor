import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import Chart from 'chart.js/auto';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

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
const IconActivity = (p) => <Icon {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></Icon>;
const IconBell = (p) => <Icon {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Icon>;
const IconFilter = (p) => <Icon {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></Icon>;
const IconRefreshCw = (p) => <Icon {...p}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></Icon>;

function Toggle({ checked, onChange }) {
  return (
    <button className="whm-toggle" data-on={checked} onClick={onChange} type="button">
      <span className="whm-toggle-knob" />
    </button>
  );
}

export default function AdminDashboard({ totalUsers, totalDomains, users, emailConfig, smsConfig, analytics }) {
  const { auth } = usePage().props;
  const user = auth.user;
  
  // Date Filter State
  const searchParams = new URLSearchParams(window.location.search);
  const initialPeriod = searchParams.get('period') || '24h';
  const initialStart = searchParams.get('start_date') ? new Date(searchParams.get('start_date')) : new Date();
  const initialEnd = searchParams.get('end_date') ? new Date(searchParams.get('end_date')) : new Date();

  const [period, setPeriod] = useState(initialPeriod);
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  
  const [activeTab, setActiveTab] = useState('users');
  const [globalLogs, setGlobalLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State for Chart Clicks
  const [modalState, setModalState] = useState({
      isOpen: false,
      title: '',
      type: '', // 'users', 'monitoring', 'domains'
      data: [],
      loading: false
  });

  const openModal = (title, type, fetchUrl) => {
      setModalState({ isOpen: true, title, type, data: [], loading: true });
      fetch(fetchUrl)
        .then(res => res.json())
        .then(resData => {
            setModalState(prev => ({ ...prev, data: resData.data, loading: false }));
        })
        .catch(err => {
            console.error(err);
            setModalState(prev => ({ ...prev, loading: false }));
        });
  };

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const fetchLogs = () => {
      setLoadingLogs(true);
      fetch(route('admin.activity_logs'))
        .then(res => res.json())
        .then(data => { setGlobalLogs(data.logs.data); setLoadingLogs(false); })
        .catch(() => setLoadingLogs(false));
  };

  const toggleUserLogging = (u) => {
      router.post(route('admin.users.toggle_logging', u.id), {}, { preserveScroll: true });
  };

  const toggleUserAccess = (u) => {
      router.post(route('admin.users.toggle_access', u.id), {}, { preserveScroll: true });
  };

  const bulkToggleLogging = (enabled) => {
      if (selectedUsers.length === 0) return;
      router.post(route('admin.users.bulk_toggle_logging'), { user_ids: selectedUsers, enabled }, {
          preserveScroll: true,
          onSuccess: () => setSelectedUsers([])
      });
  };

  const toggleSelectUser = (id) => {
      if (selectedUsers.includes(id)) setSelectedUsers(selectedUsers.filter(uid => uid !== id));
      else setSelectedUsers([...selectedUsers, id]);
  };
  
  // Chart refs to destroy old charts on update
  const chartRefs = useRef({});

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
    
    // Re-render charts on theme change if they exist
    if (chartRefs.current) {
      Object.values(chartRefs.current).forEach(chart => {
        if (chart) {
            chart.options.color = dark ? '#cbd5e1' : '#475569';
            if (chart.options.scales?.x) chart.options.scales.x.grid.color = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            if (chart.options.scales?.y) chart.options.scales.y.grid.color = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            chart.update();
        }
      });
    }
  }, [dark]);

  useEffect(() => {
    if (!analytics) return;
    
    // Destroy previous charts before creating new ones to prevent overlap on data refresh
    Object.values(chartRefs.current).forEach(chart => {
        if (chart) chart.destroy();
    });
    
    const textColor = dark ? '#cbd5e1' : '#475569';
    const gridColor = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      color: textColor,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } }
      }
    };

    // 1. User Growth Chart
    const userGrowthCtx = document.getElementById('userGrowthChart');
    if (userGrowthCtx) {
      chartRefs.current.userGrowth = new Chart(userGrowthCtx, {
        type: 'line',
        data: {
          labels: analytics.userGrowth.map(d => d.date),
          datasets: [{
            label: 'Total Users',
            data: analytics.userGrowth.map(d => d.count),
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          ...commonOptions,
          onClick: (e, elements, chart) => {
            if (elements.length > 0) {
                const idx = elements[0].index;
                const rawDate = analytics.userGrowth[idx].raw_date;
                const label = analytics.userGrowth[idx].date;
                openModal(`Users Joined (${label})`, 'users', `/admin/api/analytics/users?date=${rawDate}`);
            }
          }
        }
      });
    }

    // 2. Hourly Uptime Chart
    const uptimeCtx = document.getElementById('uptimeChart');
    if (uptimeCtx) {
      chartRefs.current.uptime = new Chart(uptimeCtx, {
        type: 'bar',
        data: {
          labels: analytics.hourlyData.map(d => d.time),
          datasets: [{
            label: 'Uptime %',
            data: analytics.hourlyData.map(d => d.uptime),
            backgroundColor: analytics.hourlyData.map(d => 
              d.uptime > 99 ? '#10b981' : (d.uptime > 95 ? '#f59e0b' : '#ef4444')
            ),
            borderRadius: 4
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            ...commonOptions.scales,
            y: { ...commonOptions.scales.y, min: 90, max: 100 }
          },
          onClick: (e, elements, chart) => {
            if (elements.length > 0) {
                const idx = elements[0].index;
                const rawTime = analytics.hourlyData[idx].raw_time;
                const label = analytics.hourlyData[idx].time;
                openModal(`Poor Performance Checks (${label})`, 'monitoring', `/admin/api/analytics/monitoring?time_bucket=${rawTime}`);
            }
          }
        }
      });
    }

    // 3. Response Time Chart
    const responseTimeCtx = document.getElementById('responseTimeChart');
    if (responseTimeCtx) {
      chartRefs.current.responseTime = new Chart(responseTimeCtx, {
        type: 'line',
        data: {
          labels: analytics.hourlyData.map(d => d.time),
          datasets: [{
            label: 'Avg Response Time (ms)',
            data: analytics.hourlyData.map(d => d.response_time),
            borderColor: '#8b5cf6',
            borderWidth: 2,
            tension: 0.3
          }]
        },
        options: {
          ...commonOptions,
          onClick: (e, elements, chart) => {
            if (elements.length > 0) {
                const idx = elements[0].index;
                const rawTime = analytics.hourlyData[idx].raw_time;
                const label = analytics.hourlyData[idx].time;
                openModal(`Poor Performance Checks (${label})`, 'monitoring', `/admin/api/analytics/monitoring?time_bucket=${rawTime}`);
            }
          }
        }
      });
    }

    // 4. Domain Status Doughnut
    const domainStatusCtx = document.getElementById('domainStatusChart');
    if (domainStatusCtx) {
      const statuses = Object.keys(analytics.domainStatus);
      const data = Object.values(analytics.domainStatus);
      chartRefs.current.domainStatus = new Chart(domainStatusCtx, {
        type: 'doughnut',
        data: {
          labels: statuses,
          datasets: [{
            data: data,
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#64748b'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          color: textColor,
          plugins: {
            legend: { position: 'right', labels: { color: textColor } }
          },
          onClick: (e, elements, chart) => {
            if (elements.length > 0) {
                const idx = elements[0].index;
                const status = statuses[idx];
                openModal(`Domains (${status.toUpperCase()})`, 'domains', `/admin/api/analytics/domains?status=${status}`);
            }
          }
        }
      });
    }

  }, [analytics]); // Re-run when new analytics data is fetched

  const applyFilter = () => {
      const data = { period };
      if (period === 'custom') {
          // Format as YYYY-MM-DD
          data.start_date = startDate.toISOString().split('T')[0];
          data.end_date = endDate.toISOString().split('T')[0];
      }
      router.get(route('admin.dashboard'), data, {
          preserveState: true,
          preserveScroll: true,
          only: ['analytics']
      });
  };

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

@keyframes whmPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.whm-skeleton {
  height: 16px;
  background: var(--surface-hover);
  border-radius: 4px;
  margin-bottom: 12px;
  animation: whmPulse 1.5s ease-in-out infinite;
}

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
.whm-form-input, .whm-form-select, .react-datepicker__input-container input { background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-primary); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 14px; outline: none; transition: all 0.2s; width: 100%; }
.whm-form-input:focus, .whm-form-select:focus, .react-datepicker__input-container input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
.whm-form-select option { background: var(--bg-primary); color: var(--text-primary); }

/* FILTER BAR */
.whm-filter-bar { position: relative; z-index: 10; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 24px; display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; backdrop-filter: blur(10px); }
.react-datepicker-wrapper { width: auto; }
.react-datepicker { font-family: 'Inter', system-ui, sans-serif !important; border-color: var(--border) !important; background: var(--bg-secondary) !important; }
.react-datepicker__header { background: var(--surface) !important; border-bottom: 1px solid var(--border) !important; }
.react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header { color: var(--text-primary) !important; }
.react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name { color: var(--text-secondary) !important; }
.react-datepicker__day:hover { background: var(--surface-hover) !important; }
.react-datepicker__day--selected { background: var(--accent) !important; color: white !important; }

/* TOGGLE */
.whm-toggle { width: 44px; height: 24px; border-radius: 12px; background: rgba(255,255,255,0.1); border: 1px solid var(--border); position: relative; cursor: pointer; transition: all 0.3s; padding: 0; }
[data-theme="light"] .whm-toggle { background: rgba(0,0,0,0.1); }
.whm-toggle[data-on="true"] { background: var(--accent-secondary); border-color: var(--accent-secondary); box-shadow: 0 0 10px rgba(139, 92, 246, 0.4); }
.whm-toggle-knob { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.whm-toggle[data-on="true"] .whm-toggle-knob { left: 22px; }

/* RESPONSIVE DESIGN */
@media (max-width: 1100px) {
  .whm-stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .whm-header { flex-direction: column; align-items: flex-start; }
  .whm-header-actions { width: 100%; flex-wrap: wrap; }
}
@media (max-width: 768px) {
  .whm-grid-2 { grid-template-columns: 1fr; }
  .whm-table th:nth-child(4), .whm-table td:nth-child(4),
  .whm-table th:nth-child(6), .whm-table td:nth-child(6) { display: none; } /* Hide Role and Joined on small screens */
}
@media (max-width: 640px) {
  .whm-container { padding: 16px 12px 32px; }
  
  .whm-header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
  }
  .whm-user-chip { flex: 1; justify-content: center; }
  .whm-header-actions > .whm-btn-icon { flex: 0 0 auto; }
  .whm-header-actions > .whm-btn:not(.whm-btn-icon) { width: 100%; justify-content: center; margin-top: 4px; }
  
  .whm-stats-grid { grid-template-columns: 1fr; gap: 16px; }
  .whm-stat-card { padding: 16px; }
  .whm-filter-bar { flex-direction: column; align-items: stretch; }
  .whm-filter-bar .whm-form-group { width: 100%; }
  .whm-filter-bar .whm-btn { width: 100%; }
  .whm-table-card .whm-table-header { flex-direction: column; align-items: flex-start; gap: 12px; }
}
`;

  return (
    <>
      <Head title="Admin Control" />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="whm-container">
        
        {modalState.isOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeModal}>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{modalState.title}</h3>
                        <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '28px', lineHeight: '20px' }}>&times;</button>
                    </div>
                    <div style={{ padding: '0', overflowY: 'auto', flex: 1 }}>
                        {modalState.loading ? (
                            <div style={{ padding: '30px' }}>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                        <div className="whm-skeleton" style={{ width: '30%', height: '20px' }}></div>
                                        <div className="whm-skeleton" style={{ width: '20%', height: '20px' }}></div>
                                        <div className="whm-skeleton" style={{ width: '25%', height: '20px' }}></div>
                                        <div className="whm-skeleton" style={{ width: '25%', height: '20px' }}></div>
                                    </div>
                                ))}
                            </div>
                        ) : modalState.data.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px' }}>No detailed data found for this selection.</div>
                        ) : (
                            <table className="whm-table" style={{ width: '100%' }}>
                                {modalState.type === 'users' && (
                                    <>
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}><tr><th>Name</th><th>Email</th><th>Plan</th><th>Joined</th></tr></thead>
                                        <tbody>
                                            {modalState.data.map((u, i) => <tr key={i}><td style={{fontWeight: '600'}}>{u.name}</td><td>{u.email}</td><td><span className={`whm-badge ${u.plan === 'Free Trial' ? 'whm-badge-trial' : (u.plan === 'No Plan' ? 'whm-badge-none' : 'whm-badge-pro')}`}>{u.plan}</span></td><td style={{fontSize: '12px'}}>{u.joined}</td></tr>)}
                                        </tbody>
                                    </>
                                )}
                                {modalState.type === 'monitoring' && (
                                    <>
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}><tr><th>URL</th><th>Status</th><th>Response Time</th><th>Time</th></tr></thead>
                                        <tbody>
                                            {modalState.data.map((m, i) => <tr key={i}><td><a href={m.url} target="_blank" style={{color: 'var(--accent)', textDecoration: 'none'}}>{m.url}</a></td><td><span className={`whm-badge ${m.status==='UP'?'whm-badge-trial':'whm-badge-admin'}`}>{m.status}</span></td><td>{m.response_time}</td><td style={{fontSize: '12px'}}>{m.time}</td></tr>)}
                                        </tbody>
                                    </>
                                )}
                                {modalState.type === 'domains' && (
                                    <>
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}><tr><th>URL</th><th>Owner</th><th>Last Checked</th></tr></thead>
                                        <tbody>
                                            {modalState.data.map((d, i) => <tr key={i}><td><a href={d.url} target="_blank" style={{color: 'var(--accent)', textDecoration: 'none'}}>{d.url}</a></td><td>{d.owner}</td><td>{d.last_checked}</td></tr>)}
                                        </tbody>
                                    </>
                                )}
                            </table>
                        )}
                    </div>
                </div>
            </div>
        )}
        
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
          
          <div className="whm-stat-card" style={{ borderTop: '2px solid var(--success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="whm-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
                <IconActivity size={24} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '800' }}>{analytics?.uptimeRate}%</div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600' }}>SYSTEM UPTIME ({period === 'today' ? 'TODAY' : period === '24h' ? '24H' : period === '7d' ? '7 DAYS' : period === '30d' ? '30 DAYS' : period === '1y' ? '1 YEAR' : 'CUSTOM'})</div>
            </div>
          </div>

          <div className="whm-stat-card" style={{ borderTop: '2px solid var(--warning)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="whm-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
                <IconBell size={24} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '800' }}>{analytics?.alertsSent}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600' }}>ALERTS SENT ({period === 'today' ? 'TODAY' : period === '24h' ? '24H' : period === '7d' ? '7 DAYS' : period === '30d' ? '30 DAYS' : period === '1y' ? '1 YEAR' : 'CUSTOM'})</div>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="whm-filter-bar" style={{ marginBottom: '24px' }}>
          <div className="whm-form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
            <label className="whm-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconFilter size={14} /> Analytics Period
            </label>
            <select className="whm-form-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="today">Today</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">Last Year</option>
              <option value="custom">Custom Range...</option>
            </select>
          </div>

          {period === 'custom' && (
            <>
              <div className="whm-form-group" style={{ marginBottom: 0 }}>
                <label className="whm-form-label">Start Date</label>
                <DatePicker 
                  selected={startDate} 
                  onChange={(date) => setStartDate(date)} 
                  dateFormat="yyyy-MM-dd"
                  maxDate={endDate || new Date()}
                />
              </div>
              <div className="whm-form-group" style={{ marginBottom: 0 }}>
                <label className="whm-form-label">End Date</label>
                <DatePicker 
                  selected={endDate} 
                  onChange={(date) => setEndDate(date)} 
                  dateFormat="yyyy-MM-dd"
                  minDate={startDate}
                  maxDate={new Date()}
                />
              </div>
            </>
          )}

          <button className="whm-btn whm-btn-primary" onClick={applyFilter}>Apply Filter</button>
        </div>

        {/* CHARTS */}
        <div className="whm-grid-2" style={{ marginBottom: '8px' }}>
          
          {/* User Growth */}
          <div className="whm-table-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>User Growth (30 Days)</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <canvas id="userGrowthChart"></canvas>
            </div>
          </div>

          {/* System Uptime */}
          <div className="whm-table-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Hourly Uptime (24h)</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <canvas id="uptimeChart"></canvas>
            </div>
          </div>

          {/* Response Time */}
          <div className="whm-table-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Avg Response Time (24h)</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <canvas id="responseTimeChart"></canvas>
            </div>
          </div>

          {/* Domain Status */}
          <div className="whm-table-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Domain Status</h3>
            <div style={{ flex: 1, minHeight: '300px', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <canvas id="domainStatusChart"></canvas>
            </div>
          </div>

        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <button 
            onClick={() => setActiveTab('users')} 
            style={{ background: 'none', border: 'none', padding: '12px 24px', fontSize: '15px', fontWeight: '600', color: activeTab === 'users' ? 'var(--accent)' : 'var(--text-tertiary)', borderBottom: activeTab === 'users' ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer' }}
          >
            User Management
          </button>
          <button 
            onClick={() => { setActiveTab('activity'); fetchLogs(); }} 
            style={{ background: 'none', border: 'none', padding: '12px 24px', fontSize: '15px', fontWeight: '600', color: activeTab === 'activity' ? 'var(--accent)' : 'var(--text-tertiary)', borderBottom: activeTab === 'activity' ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer' }}
          >
            Global Activity Logs
          </button>
        </div>

        {/* USERS TABLE */}
        {activeTab === 'users' && (() => {
          const USERS_PER_PAGE = 10;
          const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
          const paginatedUsers = users.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

          return (
            <div className="whm-table-card">
              <div className="whm-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="whm-table-title">Registered Users</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Overview of all registered accounts and their subscription status.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {selectedUsers.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="whm-btn whm-btn-ghost" onClick={() => bulkToggleLogging(true)} style={{ fontSize: '12px', padding: '6px 12px' }}>Enable Logging</button>
                      <button className="whm-btn whm-btn-ghost-muted" onClick={() => bulkToggleLogging(false)} style={{ fontSize: '12px', padding: '6px 12px' }}>Disable Logging</button>
                    </div>
                  )}
                  <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600', whiteSpace: 'nowrap' }}>{users.length} users</span>
                </div>
              </div>
              <div className="whm-table-wrapper" style={{ maxHeight: '520px', overflowY: 'auto' }}>
                <table className="whm-table">
                  <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Subscription</th>
                      <th>Domains</th>
                      <th>Joined</th>
                      <th>Access</th>
                      <th>Logging</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length > 0 ? paginatedUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggleSelectUser(u.id)} />
                        </td>
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
                        <td>
                          <Toggle checked={u.is_active} onChange={() => toggleUserAccess(u)} />
                        </td>
                        <td>
                          <Toggle checked={u.activity_logging_enabled} onChange={() => toggleUserLogging(u)} />
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    Showing {(currentPage - 1) * USERS_PER_PAGE + 1}–{Math.min(currentPage * USERS_PER_PAGE, users.length)} of {users.length}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="whm-btn"
                      style={{ padding: '6px 14px', fontSize: '13px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className="whm-btn"
                        style={{
                          padding: '6px 12px', fontSize: '13px', minWidth: '36px',
                          background: page === currentPage ? 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' : 'var(--surface)',
                          border: page === currentPage ? 'none' : '1px solid var(--border)',
                          color: page === currentPage ? 'white' : 'var(--text-primary)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setCurrentPage(page)}
                      >{page}</button>
                    ))}
                    <button
                      className="whm-btn"
                      style={{ padding: '6px 14px', fontSize: '13px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >Next →</button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ACTIVITY LOGS TABLE */}
        {activeTab === 'activity' && (
          <div className="whm-table-card">
            <div className="whm-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="whm-table-title">Global Activity Logs</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Real-time stream of all user actions across the platform.</p>
              </div>
              <button className="whm-btn whm-btn-ghost" onClick={fetchLogs}><IconRefreshCw size={14} /> Refresh</button>
            </div>
            <div className="whm-table-wrapper" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="whm-table">
                <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>IP Address</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLogs ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading logs...</td></tr>
                  ) : globalLogs.length > 0 ? globalLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: '600' }}>{log.user ? log.user.name : 'Unknown User'}</td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: 'rgba(99,102,241,0.15)', color: 'var(--accent)', textTransform: 'uppercase' }}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-primary)' }}>
                        <div>{log.description}</div>
                        {log.details && (
                          <div style={{ marginTop: '6px', fontSize: '12px', background: 'var(--surface-hover)', padding: '8px', borderRadius: '6px' }}>
                            {Object.entries(log.details).map(([key, value]) => (
                                <div key={key}>
                                    <strong>{key.replace('_', ' ')}:</strong>{' '}
                                    <span style={{ color: 'var(--danger)', textDecoration: 'line-through' }}>{value.old}</span>
                                    {' → '}
                                    <span style={{ color: 'var(--success)' }}>{value.new}</span>
                                </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-tertiary)' }}>{log.ip_address || '-'}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>No activity logs recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
