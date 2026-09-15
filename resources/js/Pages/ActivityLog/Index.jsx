import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

const IconChevronLeft = (p) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="15 18 9 12 15 6"/></svg>;
const IconActivity = (p) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

export default function ActivityLogIndex({ logs }) {
    const { auth } = usePage().props;
    const [dark, setDark] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('whm-theme');
        if (saved === 'light') setDark(false);
    }, []);

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(d);
    };

    return (
        <>
            <Head title="Activity Log" />
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                
                .whm-act-root {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    background: var(--bg-primary);
                    min-height: 100vh;
                    color: var(--text-primary);
                    padding: 40px 20px;
                }
                .whm-act-root[data-theme="light"] {
                    --bg-primary: #f8fafc;
                    --bg-secondary: #f1f5f9;
                    --surface: #ffffff;
                    --border: rgba(99,102,241,0.15);
                    --text-primary: #0f172a;
                    --text-secondary: #475569;
                    --text-tertiary: #94a3b8;
                    --accent: #4f46e5;
                    --card-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }
                .whm-act-root[data-theme="dark"] {
                    --bg-primary: #06060e;
                    --bg-secondary: #0c0d1a;
                    --surface: #0f1021;
                    --border: rgba(255,255,255,0.1);
                    --text-primary: #eef2ff;
                    --text-secondary: #a5b4fc;
                    --text-tertiary: #6b7db3;
                    --accent: #6366f1;
                    --card-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }

                .whm-act-container { max-width: 900px; margin: 0 auto; }
                
                .whm-back-link {
                    display: inline-flex; align-items: center; gap: 6px;
                    color: var(--text-secondary); text-decoration: none; font-size: 14px; font-weight: 500;
                    margin-bottom: 24px; transition: color 0.2s;
                }
                .whm-back-link:hover { color: var(--accent); }

                .whm-card {
                    background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
                    padding: 32px; box-shadow: var(--card-shadow); margin-bottom: 32px;
                }
                
                .log-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .log-table th { 
                    text-align: left; padding: 12px; font-size: 13px; text-transform: uppercase; 
                    letter-spacing: 0.5px; color: var(--text-secondary); border-bottom: 1px solid var(--border); 
                }
                .log-table td { padding: 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
                .log-table tr:last-child td { border-bottom: none; }
                .log-table tr:hover { background: rgba(99,102,241,0.03); }
                
                .log-action-badge {
                    display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;
                    background: rgba(99,102,241,0.15); color: var(--accent); text-transform: capitalize;
                }
                
                @media (max-width: 600px) {
                    .log-table th:nth-child(3), .log-table td:nth-child(3) { display: none; }
                    .log-table th:nth-child(4), .log-table td:nth-child(4) { display: none; }
                }
                @media (max-width: 640px) {
                    .whm-act-root { padding: 20px 12px; }
                    .whm-card { padding: 20px 16px; }
                    .log-table th, .log-table td { padding: 12px 8px; font-size: 13px; }
                }
            `}} />

            <div className="whm-act-root" data-theme={dark ? 'dark' : 'light'}>
                <div className="whm-act-container">
                    <Link href="/dashboard" className="whm-back-link">
                        <IconChevronLeft size={16} /> Back to Dashboard
                    </Link>
                    
                    <div className="whm-card">
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <IconActivity size={24} style={{ color: 'var(--accent)', marginRight: '12px' }} />
                            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>My Activity Log</h1>
                        </div>
                        <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>
                            A complete history of actions performed on your account.
                        </p>
                        
                        {!auth.user.activity_logging_enabled && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: '500' }}>
                                Activity logging has been disabled for your account by an administrator. New actions will not be recorded.
                            </div>
                        )}

                        {logs.data.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="log-table">
                                    <thead>
                                        <tr>
                                            <th>Action</th>
                                            <th>Description</th>
                                            <th>IP Address</th>
                                            <th>Date & Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.data.map((log) => (
                                            <tr key={log.id}>
                                                <td><span className="log-action-badge">{log.action.replace('_', ' ')}</span></td>
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
                                                <td style={{ color: 'var(--text-secondary)' }}>{formatDate(log.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                                No activity logs found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
