import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

/* SVG Icons */
const Icon = ({ children, size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>
);
const IconShield = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
const IconCheck = (p) => <Icon {...p}><polyline points="20 6 9 17 4 12"/></Icon>;
const IconChevronLeft = (p) => <Icon {...p}><polyline points="15 18 9 12 15 6"/></Icon>;
const IconZap = (p) => <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>;

export default function SubscriptionIndex({ subscriptionDetails, razorpayKey, plans, currentPlanId }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [dark, setDark] = useState(true);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [loadingPlan, setLoadingPlan] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('whm-theme');
        if (saved === 'light') setDark(false);

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
    }, []);

    const getRank = (planKey) => {
        if (!planKey) return 0;
        if (planKey.includes('trial')) return 0;
        if (planKey.includes('starter')) return 1;
        if (planKey.includes('pro')) return 2;
        if (planKey.includes('enterprise')) return 3;
        return 0;
    };

    const handleUpdatePlan = async (newPlanKey) => {
        const currentRank = getRank(currentPlanId);
        const newRank = getRank(newPlanKey);
        
        const isDowngrade = newRank < currentRank;
        
        let confirmText = `Are you sure you want to upgrade to ${newPlanKey.replace('_', ' ').toUpperCase()}?`;
        let confirmBtnText = 'Yes, Upgrade';
        
        if (isDowngrade) {
            confirmText = `Are you sure you want to downgrade to ${newPlanKey.replace('_', ' ').toUpperCase()}? Some features may be restricted immediately.`;
            confirmBtnText = 'Yes, Downgrade';
        }

        const result = await Swal.fire({
            title: isDowngrade ? 'Confirm Downgrade' : 'Confirm Upgrade',
            text: confirmText,
            icon: isDowngrade ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: isDowngrade ? '#ef4444' : '#4f46e5',
            cancelButtonColor: '#64748b',
            confirmButtonText: confirmBtnText
        });

        if (!result.isConfirmed) return;

        setLoadingPlan(newPlanKey);
        try {
            const response = await fetch('/payment/subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ plan_id: plans[newPlanKey] })
            });

            const data = await response.json();

            if (data.status === 'updated') {
                await Swal.fire('Success!', 'Your plan has been updated successfully.', 'success');
                window.location.reload();
                return;
            }

            if (!data.subscription_id) {
                Swal.fire('Error', 'Failed to initialize payment.', 'error');
                setLoadingPlan(null);
                return;
            }

            // Fallback for new auth
            const options = {
                key: razorpayKey,
                subscription_id: data.subscription_id,
                name: 'Website Health Monitor',
                description: newPlanKey.replace('_', ' ').toUpperCase() + ' Subscription',
                handler: function (response) {
                    router.post('/payment/verify', {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_subscription_id: response.razorpay_subscription_id,
                        razorpay_signature: response.razorpay_signature
                    }, {
                        onSuccess: () => Swal.fire('Success', 'Subscription Activated!', 'success')
                    });
                },
                theme: { color: '#6366f1' }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function () {
                setLoadingPlan(null);
            });
            rzp.open();

        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Something went wrong.', 'error');
            setLoadingPlan(null);
        }
    };

    const getPlanAction = (planKey) => {
        // Map local key to razorpay ID logic
        const planRzpId = plans[planKey];
        if (currentPlanId === planRzpId) {
            return (
                <button disabled className="whm-btn whm-btn-disabled" style={{width: '100%', opacity: 0.6}}>
                    Current Plan
                </button>
            );
        }

        const isDowngrade = getRank(planKey) < getRank(currentPlanId);
        
        return (
            <button 
                onClick={() => handleUpdatePlan(planKey)} 
                disabled={loadingPlan === planKey}
                className={`whm-btn ${isDowngrade ? 'whm-btn-outline' : 'whm-btn-primary'}`} 
                style={{width: '100%'}}>
                {loadingPlan === planKey ? 'Processing...' : (isDowngrade ? 'Downgrade' : 'Upgrade Plan')}
            </button>
        );
    };

    return (
        <>
            <Head title="My Subscription" />
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
                    --surface: #ffffff;
                    --border: rgba(99,102,241,0.15);
                    --text-primary: #0f172a;
                    --text-secondary: #475569;
                    --text-tertiary: #94a3b8;
                    --accent: #4f46e5;
                    --success: #10b981;
                    --card-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }
                .whm-sub-root[data-theme="dark"] {
                    --bg-primary: #06060e;
                    --bg-secondary: #0c0d1a;
                    --surface: #0f1021;
                    --border: rgba(255,255,255,0.1);
                    --text-primary: #eef2ff;
                    --text-secondary: #a5b4fc;
                    --text-tertiary: #6b7db3;
                    --accent: #6366f1;
                    --success: #10b981;
                    --card-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }

                .whm-sub-container {
                    max-width: 1000px;
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
                .whm-back-link:hover { color: var(--accent); }

                .whm-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 32px;
                    box-shadow: var(--card-shadow);
                    margin-bottom: 32px;
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
                .whm-btn-disabled {
                    background: var(--bg-secondary);
                    color: var(--text-tertiary);
                    cursor: not-allowed;
                }
                .whm-btn-outline {
                    background: transparent;
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                }
                .whm-btn-outline:hover {
                    background: rgba(255,255,255,0.05);
                    border-color: var(--text-secondary);
                }

                .billing-toggle {
                    display: flex; justify-content: center; margin: 40px 0 20px;
                }
                .billing-pill {
                    display: inline-flex; background: var(--surface); border: 1px solid var(--border);
                    border-radius: 30px; padding: 4px; box-shadow: var(--card-shadow);
                }
                .billing-pill button {
                    background: transparent; border: none; padding: 8px 24px; border-radius: 20px;
                    font-size: 14px; font-weight: 600; color: var(--text-secondary); cursor: pointer;
                    transition: all 0.2s;
                }
                .billing-pill button.active { background: var(--accent); color: #fff; }

                .pricing-grid {
                    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
                }
                .plan-card {
                    background: var(--surface); border: 1px solid var(--border); border-radius: 24px;
                    padding: 32px; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;
                    position: relative; overflow: hidden;
                }
                .plan-card:hover {
                    transform: translateY(-5px); box-shadow: var(--card-shadow); border-color: var(--accent);
                }
                .plan-card.is-pro {
                    border-color: var(--accent);
                    background: linear-gradient(180deg, rgba(99,102,241,0.05) 0%, transparent 100%);
                }
                .plan-card.is-pro::before {
                    content: 'Most Popular'; position: absolute; top: 12px; right: -28px;
                    background: var(--accent); color: white; font-size: 11px; font-weight: 700;
                    padding: 4px 30px; transform: rotate(45deg); letter-spacing: 0.5px;
                }
                
                @media (max-width: 900px) {
                    .pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
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
                                            {subscriptionDetails.plan.replace('_', ' ')} {subscriptionDetails.plan === 'Free Trial' ? '' : 'Plan'}
                                            {subscriptionDetails.price && subscriptionDetails.price !== 'Free' && (
                                                <span style={{ fontSize: '14px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
                                                    {subscriptionDetails.price}
                                                </span>
                                            )}
                                        </h3>
                                        <p style={{ fontSize: '15px', color: 'var(--text-tertiary)' }}>
                                            Expires on: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{subscriptionDetails.expiry}</span>
                                        </p>
                                    </div>
                                    <button onClick={() => window.scrollTo({top: document.getElementById('pricing-plans').offsetTop, behavior: 'smooth'})} className="whm-btn whm-btn-primary">
                                        Change Plan
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>You do not have an active subscription.</p>
                            </div>
                        )}
                    </div>

                    <div id="pricing-plans">
                        <div style={{textAlign: 'center', marginBottom: '20px'}}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Available Plans</h2>
                            <p style={{ color: 'var(--text-tertiary)', marginTop: '8px' }}>Upgrade or downgrade your subscription at any time.</p>
                        </div>
                        
                        <div className="billing-toggle">
                            <div className="billing-pill">
                                <button type="button" className={billingCycle === 'monthly' ? 'active' : ''} onClick={() => setBillingCycle('monthly')}>Monthly</button>
                                <button type="button" className={billingCycle === 'yearly' ? 'active' : ''} onClick={() => setBillingCycle('yearly')}>Yearly (Save 20%)</button>
                            </div>
                        </div>

                        <div className="pricing-grid">
                            {/* Starter */}
                            <div className="plan-card">
                                <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Starter</h3>
                                <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '8px', minHeight: '42px' }}>Perfect for personal projects and small sites.</div>
                                <div style={{ margin: '24px 0', fontSize: '36px', fontWeight: '800', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    ${billingCycle === 'monthly' ? '9' : '7'}
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-tertiary)' }}>/mo</span>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    {getPlanAction(`starter_${billingCycle}`)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Includes:</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <li style={{ display: 'flex', gap: '10px', fontSize: '14px' }}><IconCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} /> 10 Websites</li>
                                        <li style={{ display: 'flex', gap: '10px', fontSize: '14px' }}><IconCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} /> 5-minute check interval</li>
                                        <li style={{ display: 'flex', gap: '10px', fontSize: '14px' }}><IconCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} /> Email alerts</li>
                                        <li style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--text-tertiary)' }}><IconCheck size={18} style={{ color: 'var(--border)', flexShrink: 0 }} /> 30-day log retention</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Pro */}
                            <div className="plan-card is-pro">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconZap size={20} style={{ color: 'var(--accent)' }} />
                                    <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Pro</h3>
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '8px', minHeight: '42px' }}>For professional developers and agencies.</div>
                                <div style={{ margin: '24px 0', fontSize: '36px', fontWeight: '800', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    ${billingCycle === 'monthly' ? '29' : '23'}
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-tertiary)' }}>/mo</span>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    {getPlanAction(`pro_${billingCycle}`)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Includes:</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <li style={{ display: 'flex', gap: '10px', fontSize: '14px' }}><IconCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} /> 50 Websites</li>
                                        <li style={{ display: 'flex', gap: '10px', fontSize: '14px' }}><IconCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} /> 1-minute check interval</li>
                                        <li style={{ display: 'flex', gap: '10px', fontSize: '14px' }}><IconCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} /> Email + SMS + Slack</li>
                                        <li style={{ display: 'flex', gap: '10px', fontSize: '14px' }}><IconCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} /> SSL monitoring</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Enterprise */}
                            <div className="plan-card">
                                <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Enterprise</h3>
                                <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '8px', minHeight: '42px' }}>For large scale operations and teams.</div>
                                <div style={{ margin: '24px 0', fontSize: '36px', fontWeight: '800', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    ${billingCycle === 'monthly' ? '79' : '63'}
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-tertiary)' }}>/mo</span>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    {getPlanAction(`enterprise_${billingCycle}`)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Includes:</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <li style={{ display: 'flex', gap: '10px', fontSize: '14px' }}><IconCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} /> Unlimited websites</li>
                                        <li style={{ display: 'flex', gap: '10px', fontSize: '14px' }}><IconCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} /> 30-second check interval</li>
                                        <li style={{ display: 'flex', gap: '10px', fontSize: '14px' }}><IconCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} /> All notification channels</li>
                                        <li style={{ display: 'flex', gap: '10px', fontSize: '14px' }}><IconCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} /> Priority support</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
