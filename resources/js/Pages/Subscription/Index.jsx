import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

/* ─── SVG Icon Components ─── */
const Icon = ({ children, size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>
);
const IconShield = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
const IconCheck = (p) => <Icon {...p}><polyline points="20 6 9 17 4 12"/></Icon>;
const IconChevronLeft = (p) => <Icon {...p}><polyline points="15 18 9 12 15 6"/></Icon>;

export default function SubscriptionIndex({ subscriptionDetails }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [dark, setDark] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('whm-theme');
        if (saved === 'light') setDark(false);
    }, []);

    return (
        <>
            <Head>
                <title>My Subscription — Website Health Monitor</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            </Head>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                
                .whm-sub-root {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    background: var(--bg-primary);
                    min-height: 100vh;
                    color: var(--text-primary);
                    padding: 40px 20px;
                }
                .whm-sub-root[data-theme="light"] {
                    --bg-primary: #f8fafc;
                    --bg-secondary: #f1f5f9;
                    --surface: rgba(255,255,255,1);
                    --border: rgba(99,102,241,0.15);
                    --text-primary: #0f172a;
                    --text-secondary: #475569;
                    --text-tertiary: #94a3b8;
                    --accent: #4f46e5;
                    --success: #10b981;
                }
                .whm-sub-root[data-theme="dark"] {
                    --bg-primary: #06060e;
                    --bg-secondary: #0c0d1a;
                    --surface: rgba(255,255,255,0.05);
                    --border: rgba(255,255,255,0.1);
                    --text-primary: #eef2ff;
                    --text-secondary: #a5b4fc;
                    --text-tertiary: #6b7db3;
                    --accent: #6366f1;
                    --success: #10b981;
                }

                .whm-sub-container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .whm-back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 24px;
                    transition: color 0.2s;
                }
                .whm-back-link:hover {
                    color: var(--accent);
                }

                .whm-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 32px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }

                .whm-badge {
                    display: inline-block;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 12px;
                    background: rgba(99,102,241,0.15);
                    color: var(--accent);
                    letter-spacing: 0.5px;
                    margin-left: 12px;
                }

                .whm-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.2s;
                    border: none;
                }
                .whm-btn-primary {
                    background: linear-gradient(135deg, var(--accent), #8b5cf6);
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
                }
                .whm-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(99,102,241,0.4);
                }

            `}} />

            <div className="whm-sub-root" data-theme={dark ? 'dark' : 'light'}>
                <div className="whm-sub-container">
                    <Link href="/dashboard" className="whm-back-link">
                        <IconChevronLeft size={16} /> Back to Dashboard
                    </Link>
                    
                    <div className="whm-card">
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                            <IconShield size={24} style={{ color: 'var(--accent)', marginRight: '12px' }} />
                            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>My Subscription</h1>
                            {subscriptionDetails && (
                                <span className="whm-badge">
                                    {subscriptionDetails.type === 'trial' ? 'TRIAL ACTIVE' : 'ACTIVE'}
                                </span>
                            )}
                        </div>

                        {subscriptionDetails ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div>
                                        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {subscriptionDetails.plan.replace('_', ' ')} Plan
                                            {subscriptionDetails.price && (
                                                <span style={{ fontSize: '14px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
                                                    {subscriptionDetails.price}
                                                </span>
                                            )}
                                        </h3>
                                        <p style={{ fontSize: '15px', color: 'var(--text-tertiary)' }}>
                                            Expires on: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{subscriptionDetails.expiry}</span>
                                        </p>
                                    </div>
                                    <a href="/#pricing" className="whm-btn whm-btn-primary">
                                        Upgrade Plan
                                    </a>
                                </div>
                                
                                <div style={{ marginTop: '10px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan Features Included</h4>
                                    <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', listStyle: 'none', margin: 0, padding: 0 }}>
                                        {subscriptionDetails.features.map((feature, i) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: 'var(--text-primary)' }}>
                                                <span style={{ color: 'var(--success)' }}><IconCheck size={18} /></span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>You do not have an active subscription.</p>
                                <Link href="/payment/checkout" className="whm-btn whm-btn-primary">
                                    Subscribe Now
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
