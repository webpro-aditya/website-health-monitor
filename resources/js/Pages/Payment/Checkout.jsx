import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Checkout({ trialDays, razorpayKey, plans, selectedPlan, currentSubscription }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async () => {
        // Downgrade check
        const getRank = (planKey) => {
            if (!planKey) return 0;
            if (planKey.includes('starter')) return 1;
            if (planKey.includes('pro')) return 2;
            if (planKey.includes('enterprise')) return 3;
            return 0;
        };

        const currentPlanKey = Object.keys(plans).find(key => plans[key] === currentSubscription?.plan);
        const isDowngrade = getRank(selectedPlan) < getRank(currentPlanKey);
        
        const isExpiryMoreThanOneMonth = () => {
            if (!currentSubscription?.expiry) return false;
            const expiryDate = new Date(currentSubscription.expiry);
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
            return expiryDate > oneMonthFromNow;
        };

        if (isDowngrade && isExpiryMoreThanOneMonth()) {
            const result = await Swal.fire({
                title: 'Downgrade Warning',
                text: "You are downgrading your plan, but your current plan doesn't expire for more than a month. Are you sure you want to proceed?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7db3',
                confirmButtonText: 'Yes, downgrade anyway'
            });
            if (!result.isConfirmed) return;
        }

        setLoading(true);
        try {
            // Get subscription ID from backend
            const response = await fetch('/payment/subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ plan_id: plans[selectedPlan] || plans.pro_monthly })
            });

            const data = await response.json();

            if (!data.subscription_id) {
                alert('Failed to initialize payment.');
                setLoading(false);
                return;
            }

            const options = {
                key: razorpayKey,
                subscription_id: data.subscription_id,
                name: 'Website Health Monitor',
                description: selectedPlan.replace('_', ' ').toUpperCase() + ' Subscription',
                handler: function (response) {
                    // Send to backend to verify and mark active
                    router.post('/payment/verify', {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_subscription_id: response.razorpay_subscription_id,
                        razorpay_signature: response.razorpay_signature
                    });
                },
                theme: {
                    color: '#6366f1'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        router.post('/payment/skip');
    };

    return (
        <>
            <Head title="Checkout" />
            
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Complete Your Setup
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            You're almost there! Choose how you'd like to proceed.
                        </p>
                    </div>
                    
                    <div className="mt-8 space-y-6">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-indigo-900 mb-2">Selected Plan: {selectedPlan.replace('_', ' ').toUpperCase()}</h3>
                            <p className="text-sm text-indigo-700">Get access to all premium monitoring features.</p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                {loading ? 'Processing...' : 'Pay Now & Subscribe'}
                            </button>
                            
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSkip}
                                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Start {trialDays}-Day Free Trial
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
