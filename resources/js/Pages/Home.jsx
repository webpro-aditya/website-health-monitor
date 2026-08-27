import React, { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Home({ trialDays }) {
  const { props } = usePage();
  const user = props.auth?.user;
  const currencySymbol = props.currency?.symbol || '$';

  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Theme Toggle
    const savedTheme = localStorage.getItem('whm-theme');
    if (savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDarkMode(true);
    }

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Intersection Observer — Scroll Reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.features-grid .reveal').forEach((el, i) => el.dataset.delay = i * 100);
    document.querySelectorAll('.steps-wrapper .reveal').forEach((el, i) => el.dataset.delay = i * 150);
    document.querySelectorAll('.pricing-grid .reveal').forEach((el, i) => el.dataset.delay = i * 120);
    document.querySelectorAll('.testimonials-grid .reveal').forEach((el, i) => el.dataset.delay = i * 120);
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


    // Smooth scroll for anchor links
    const handleAnchorClick = (e) => {
      const href = e.currentTarget.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = 80; // navbar height
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    };
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => link.addEventListener('click', handleAnchorClick));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      anchorLinks.forEach(link => link.removeEventListener('click', handleAnchorClick));
      observer.disconnect();
    };
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('whm-theme', newTheme);
    setIsDarkMode(newTheme === 'dark');
  };

  const toggleMobileMenu = () => {
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburger = document.getElementById('hamburger');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active');
    mobileOverlay.classList.toggle('show');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburger = document.getElementById('hamburger');
    const mobileOverlay = document.getElementById('mobileOverlay');
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (hamburger) hamburger.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('show');
    document.body.style.overflow = '';
  };

  const animateValue = (el, start, end, duration) => {
    const range = end - start;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + range * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const togglePricing = () => {
    const pricingToggleEl = document.getElementById('pricingToggle');
    const isYearly = !pricingToggleEl.classList.contains('yearly');
    pricingToggleEl.classList.toggle('yearly', isYearly);

    const monthlyLabel = document.getElementById('monthlyLabel');
    const yearlyLabel = document.getElementById('yearlyLabel');
    if (monthlyLabel) monthlyLabel.classList.toggle('active', !isYearly);
    if (yearlyLabel) yearlyLabel.classList.toggle('active', isYearly);

    document.querySelectorAll('.price-value').forEach(el => {
      const target = isYearly ? el.dataset.yearly : el.dataset.monthly;
      animateValue(el, parseInt(el.textContent) || 0, parseInt(target), 300);
    });

    document.querySelectorAll('.price-billed').forEach(el => {
      const text = isYearly ? el.dataset.yearly : el.dataset.monthly;
      el.innerHTML = text || '&nbsp;';
    });

    const suffix = isYearly ? '_yearly' : '_monthly';
    const prefix = user ? '/payment/checkout?plan=' : '/register?plan=';
    const btnStarter = document.getElementById('btn-starter');
    const btnPro = document.getElementById('btn-pro');
    const btnEnterprise = document.getElementById('btn-enterprise');
    if (btnStarter) btnStarter.href = prefix + 'starter' + suffix;
    if (btnPro) btnPro.href = prefix + 'pro' + suffix;
    if (btnEnterprise) btnEnterprise.href = prefix + 'enterprise' + suffix;
  };


  return (
    <>
      <Head>

        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <title>Website Health Monitor</title>
        <meta name="description" content="Monitor your websites 24/7 with real-time uptime checks, instant alerts via Email, SMS, Slack & WhatsApp, and comprehensive analytics. {trialDays || 0}" />
        <meta name="keywords" content="website monitoring, uptime monitoring, downtime alerts, website health check, SSL monitoring, server monitoring" />
        <meta name="author" content="Website Health Monitor" />

        {/*  Open Graph  */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Website Health Monitor — Real-Time Uptime Monitoring" />
        <meta property="og:description" content="Monitor your websites 24/7 with real-time uptime checks, instant alerts, and comprehensive analytics." />
        <meta property="og:url" content="" />
        <meta property="og:site_name" content="Website Health Monitor" />

        {/*  Twitter Card  */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Website Health Monitor — Real-Time Uptime Monitoring" />
        <meta name="twitter:description" content="Monitor your websites 24/7 with real-time uptime checks, instant alerts, and comprehensive analytics." />

        {/*  Fonts & Libraries  */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

        <style dangerouslySetInnerHTML={{
          __html: `
/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
:root{
  --bg:linear-gradient(135deg,#0f0c29,#1a1a3e,#0d1b2a);
  --surface:rgba(255,255,255,.04);
  --surface-strong:rgba(255,255,255,.07);
  --border:rgba(255,255,255,.08);
  --border-strong:rgba(255,255,255,.14);
  --text:#e2e8f0;
  --text-bright:#f8fafc;
  --sub:#64748b;
  --label:#94a3b8;
  --hover:rgba(99,102,241,.08);
  --footer-bg:rgba(0,0,0,.35);
  --card-shadow:0 8px 32px rgba(0,0,0,.25);
  --nav-bg:rgba(15,12,41,.82);
}
[data-theme="light"]{
  --bg:linear-gradient(135deg,#f0f4ff,#e8f0fe,#f5f0ff);
  --surface:rgba(255,255,255,.9);
  --surface-strong:rgba(255,255,255,.95);
  --border:rgba(99,102,241,.15);
  --border-strong:rgba(99,102,241,.22);
  --text:#1e293b;
  --text-bright:#0f172a;
  --sub:#64748b;
  --label:#475569;
  --hover:rgba(99,102,241,.06);
  --footer-bg:rgba(15,23,42,.95);
  --card-shadow:0 8px 32px rgba(99,102,241,.1);
  --nav-bg:rgba(240,244,255,.88);
}

/* ═══════════════════════════════════════════════════════════════
   RESET & BASE
   ═══════════════════════════════════════════════════════════════ */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{
  font-family:'Inter',system-ui,-apple-system,sans-serif;
  background:var(--bg);
  min-height:100vh;
  color:var(--text);
  transition:background .4s,color .3s;
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}
a{text-decoration:none;color:inherit;}
img{max-width:100%;display:block;}

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════ */
.container{max-width:1200px;margin:0 auto;padding:0 24px;}
.section{padding:100px 0;}
.section-label{
  display:inline-flex;align-items:center;gap:8px;
  font-size:13px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;
  color:#818cf8;margin-bottom:16px;
}
[data-theme="light"] .section-label{color:#6366f1;}
.section-title{
  font-size:clamp(28px,5vw,44px);font-weight:800;line-height:1.15;
  margin-bottom:16px;color:var(--text-bright);
}
.section-sub{font-size:17px;color:var(--sub);line-height:1.7;max-width:600px;}
.text-center{text-align:center;}
.mx-auto{margin-left:auto;margin-right:auto;}

/* Glassmorphism card */
.glass{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:20px;
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
}

/* Gradient text */
.gradient-text{
  background:linear-gradient(135deg,#a5b4fc,#c084fc,#f0abfc);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
[data-theme="light"] .gradient-text{
  background:linear-gradient(135deg,#4f46e5,#7c3aed,#9333ea);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}

/* Buttons */
.btn-primary{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:14px 32px;border:none;border-radius:14px;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  color:#fff;font-size:15px;font-weight:700;font-family:inherit;
  cursor:pointer;transition:all .25s;
  box-shadow:0 4px 20px rgba(99,102,241,.4);
}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(99,102,241,.55);filter:brightness(1.08);}
.btn-outline{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:14px 32px;border:2px solid var(--border-strong);border-radius:14px;
  background:transparent;color:var(--text);font-size:15px;font-weight:700;font-family:inherit;
  cursor:pointer;transition:all .25s;
}
.btn-outline:hover{border-color:#818cf8;color:#a5b4fc;transform:translateY(-3px);}
[data-theme="light"] .btn-outline:hover{color:#6366f1;}
.btn-green{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:14px 32px;border:none;border-radius:14px;
  background:linear-gradient(135deg,#10b981,#059669);
  color:#fff;font-size:15px;font-weight:700;font-family:inherit;
  cursor:pointer;transition:all .25s;
  box-shadow:0 4px 20px rgba(16,185,129,.35);
}
.btn-green:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(16,185,129,.5);}
.btn-sm{padding:10px 22px;font-size:13px;border-radius:11px;}
.btn-lg{padding:18px 40px;font-size:17px;}

/* Scroll-triggered animation */
.reveal{opacity:0;transform:translateY(40px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1);}
.reveal.visible{opacity:1;transform:translateY(0);}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
.navbar{
  position:fixed;top:0;left:0;right:0;z-index:1000;
  background:var(--nav-bg);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
  transition:background .3s,box-shadow .3s;
}
.navbar.scrolled{box-shadow:0 4px 30px rgba(0,0,0,.15);}
.nav-inner{
  display:flex;align-items:center;justify-content:space-between;
  max-width:1200px;margin:0 auto;padding:0 24px;height:72px;
}
.nav-brand{display:flex;align-items:center;gap:10px;}
.nav-logo{
  width:40px;height:40px;border-radius:11px;
  background:linear-gradient(135deg,#6366f1,#a855f7);
  display:flex;align-items:center;justify-content:center;font-size:18px;
  box-shadow:0 0 18px rgba(99,102,241,.4);
}
.nav-brand-text{font-size:18px;font-weight:800;}
.nav-links{display:flex;align-items:center;gap:32px;list-style:none;}
.nav-links a{
  font-size:14px;font-weight:500;color:var(--sub);
  transition:color .2s;position:relative;
}
.nav-links a:hover{color:var(--text-bright);}
.nav-links a::after{
  content:'';position:absolute;bottom:-4px;left:0;right:0;
  height:2px;background:linear-gradient(90deg,#6366f1,#8b5cf6);
  border-radius:2px;transform:scaleX(0);transition:transform .25s;
}
.nav-links a:hover::after{transform:scaleX(1);}
.nav-actions{display:flex;align-items:center;gap:10px;}
.nav-login{
  padding:9px 20px;border-radius:10px;font-size:13px;font-weight:600;
  color:var(--text);background:transparent;border:1px solid var(--border);
  cursor:pointer;font-family:inherit;transition:all .2s;
}
.nav-login:hover{border-color:#818cf8;color:#a5b4fc;}
[data-theme="light"] .nav-login:hover{color:#6366f1;}
.nav-cta{
  padding:9px 20px;border-radius:10px;font-size:13px;font-weight:600;
  color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;
  cursor:pointer;font-family:inherit;transition:all .2s;
  box-shadow:0 2px 12px rgba(99,102,241,.35);
}
.nav-cta:hover{transform:translateY(-2px);box-shadow:0 4px 18px rgba(99,102,241,.5);}
.theme-toggle{
  width:40px;height:40px;border-radius:10px;border:1px solid var(--border);
  background:var(--surface);color:var(--text);font-size:18px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:all .2s;
}
.theme-toggle:hover{border-color:#818cf8;transform:translateY(-2px);}

/* Hamburger */
.hamburger{
  display:none;width:40px;height:40px;border-radius:10px;border:1px solid var(--border);
  background:var(--surface);cursor:pointer;flex-direction:column;
  align-items:center;justify-content:center;gap:5px;transition:all .2s;
}
.hamburger span{
  display:block;width:20px;height:2px;background:var(--text);
  border-radius:2px;transition:all .3s;
}
.hamburger.active span:nth-child(1){transform:rotate(45deg) translate(5px,5px);}
.hamburger.active span:nth-child(2){opacity:0;}
.hamburger.active span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px);}

/* Mobile menu */
.mobile-menu{
  position:fixed;top:72px;right:-100%;width:min(320px,85vw);bottom:0;z-index:999;
  background:var(--nav-bg);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  border-left:1px solid var(--border);
  padding:32px 24px;transition:right .35s cubic-bezier(.4,0,.2,1);
  display:flex;flex-direction:column;gap:8px;overflow-y:auto;
}
.mobile-menu.open{right:0;}
.mobile-menu a{
  display:block;padding:14px 16px;border-radius:12px;font-size:15px;
  font-weight:600;color:var(--text);transition:background .2s;
}
.mobile-menu a:hover{background:var(--hover);}
.mobile-menu .mobile-actions{margin-top:auto;display:flex;flex-direction:column;gap:10px;padding-top:24px;border-top:1px solid var(--border);}
.mobile-overlay{
  display:none;position:fixed;inset:0;top:72px;z-index:998;
  background:rgba(0,0,0,.4);
}
.mobile-overlay.show{display:block;}

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════════ */
.hero{
  position:relative;min-height:100vh;display:flex;align-items:center;
  padding-top:72px;overflow:hidden;
}
.hero-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
.hero-orb{
  position:absolute;border-radius:50%;filter:blur(80px);opacity:.35;
  animation:float 8s ease-in-out infinite;
}
[data-theme="light"] .hero-orb{opacity:.2;}
.hero-orb-1{width:500px;height:500px;background:#6366f1;top:-15%;left:-10%;animation-delay:0s;}
.hero-orb-2{width:400px;height:400px;background:#8b5cf6;bottom:-10%;right:-8%;animation-delay:2s;}
.hero-orb-3{width:300px;height:300px;background:#06b6d4;top:40%;left:55%;animation-delay:4s;}
.hero-orb-4{width:250px;height:250px;background:#ec4899;bottom:20%;left:10%;animation-delay:6s;}
@keyframes float{
  0%,100%{transform:translate(0,0) scale(1);}
  33%{transform:translate(30px,-25px) scale(1.05);}
  66%{transform:translate(-20px,15px) scale(.95);}
}

.hero-content{position:relative;z-index:2;text-align:center;padding:60px 0 40px;}
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 18px;border-radius:50px;
  background:var(--surface);border:1px solid var(--border);
  font-size:13px;font-weight:600;color:var(--label);margin-bottom:32px;
}
.hero-badge .live-dot{
  width:8px;height:8px;border-radius:50%;background:#10b981;
  box-shadow:0 0 8px #10b981;animation:pulse 1.6s infinite;
}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(1.4);}}

.hero-title{
  font-size:clamp(36px,7vw,72px);font-weight:800;line-height:1.08;
  margin-bottom:24px;letter-spacing:-1.5px;
}
.hero-title .highlight{
  background:linear-gradient(135deg,#6366f1,#8b5cf6,#c084fc);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
[data-theme="light"] .hero-title{color:#0f172a;}

.hero-subtitle{
  font-size:clamp(16px,2.5vw,20px);color:var(--sub);
  line-height:1.7;max-width:640px;margin:0 auto 40px;
}
.hero-buttons{display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;}

/* Stats bar */
.stats-bar{
  position:relative;z-index:2;margin-top:64px;
}
.stats-bar-inner{
  display:grid;grid-template-columns:repeat(4,1fr);gap:0;
  padding:0;border-radius:20px;overflow:hidden;
}
.stat-item{
  padding:28px 16px;text-align:center;
  border-right:1px solid var(--border);
  transition:background .2s;
}
.stat-item:last-child{border-right:none;}
.stat-item:hover{background:var(--hover);}
.stat-value{
  font-size:clamp(20px,3vw,28px);font-weight:800;
  margin-bottom:6px;
}
.stat-value.indigo{color:#818cf8;}
.stat-value.green{color:#34d399;}
.stat-value.blue{color:#38bdf8;}
.stat-value.amber{color:#fbbf24;}
[data-theme="light"] .stat-value.indigo{color:#6366f1;}
[data-theme="light"] .stat-value.green{color:#059669;}
[data-theme="light"] .stat-value.blue{color:#2563eb;}
[data-theme="light"] .stat-value.amber{color:#d97706;}
.stat-label{font-size:13px;color:var(--sub);font-weight:500;}

/* ═══════════════════════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════════════════════ */
.features-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:24px;
  margin-top:56px;
}
.feature-card{
  padding:36px 28px;border-radius:20px;
  background:var(--surface);border:1px solid var(--border);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  transition:all .35s cubic-bezier(.4,0,.2,1);
  cursor:default;
}
.feature-card:hover{
  transform:translateY(-8px);
  border-color:rgba(99,102,241,.35);
  box-shadow:0 20px 50px rgba(99,102,241,.15),0 0 0 1px rgba(99,102,241,.1);
}
.feature-icon{
  width:56px;height:56px;border-radius:16px;
  display:flex;align-items:center;justify-content:center;
  font-size:26px;margin-bottom:22px;
  box-shadow:0 8px 24px rgba(0,0,0,.15);
}
.feature-card h3{
  font-size:18px;font-weight:700;color:var(--text-bright);
  margin-bottom:10px;
}
.feature-card p{
  font-size:14px;color:var(--sub);line-height:1.7;
}

/* ═══════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════ */
.steps-wrapper{
  display:flex;align-items:flex-start;justify-content:center;gap:0;
  margin-top:60px;position:relative;
}
.step-card{flex:1;max-width:340px;text-align:center;padding:0 20px;position:relative;}
.step-number{
  width:64px;height:64px;border-radius:50%;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  display:flex;align-items:center;justify-content:center;
  font-size:24px;font-weight:800;color:#fff;
  margin:0 auto 24px;position:relative;z-index:2;
  box-shadow:0 8px 30px rgba(99,102,241,.4);
}
.step-connector{
  position:absolute;top:32px;left:calc(50% + 40px);
  width:calc(100% - 80px);height:2px;
  border-top:3px dashed var(--border-strong);
  z-index:1;
}
.step-card:last-child .step-connector{display:none;}
.step-icon{font-size:40px;margin-bottom:16px;}
.step-card h3{font-size:20px;font-weight:700;color:var(--text-bright);margin-bottom:10px;}
.step-card p{font-size:14px;color:var(--sub);line-height:1.7;}

/* ═══════════════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════════════ */
.pricing-toggle{
  display:flex;align-items:center;justify-content:center;gap:16px;
  margin-top:32px;margin-bottom:56px;
}
.pricing-toggle span{font-size:15px;font-weight:600;color:var(--sub);transition:color .2s;}
.pricing-toggle span.active{color:var(--text-bright);}
.toggle-switch{
  width:56px;height:30px;border-radius:15px;
  background:var(--surface-strong);border:1px solid var(--border);
  cursor:pointer;position:relative;transition:all .3s;
}
.toggle-switch.yearly{background:linear-gradient(135deg,#6366f1,#8b5cf6);border-color:transparent;}
.toggle-knob{
  position:absolute;top:3px;left:3px;
  width:22px;height:22px;border-radius:50%;background:#fff;
  transition:left .25s cubic-bezier(.4,0,.2,1);
  box-shadow:0 2px 6px rgba(0,0,0,.2);
}
.toggle-switch.yearly .toggle-knob{left:29px;}
.pricing-toggle span.yearly-badge{
  padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;
  background:linear-gradient(135deg,#10b981,#059669);color:#fff;
  box-shadow:0 2px 10px rgba(16,185,129,.3);
}
.pricing-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:24px;
  align-items:stretch;
}
.price-card{
  padding:40px 32px;border-radius:24px;
  background:var(--surface);border:1px solid var(--border);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  transition:all .35s;display:flex;flex-direction:column;
  position:relative;overflow:hidden;
}
.price-card:hover{transform:translateY(-6px);box-shadow:var(--card-shadow);}
.price-card.popular{
  border:2px solid transparent;
  background-image:linear-gradient(var(--surface),var(--surface)),linear-gradient(135deg,#6366f1,#8b5cf6,#c084fc);
  background-origin:padding-box,border-box;
  background-clip:padding-box,border-box;
  transform:scale(1.04);
}
.price-card.popular:hover{transform:scale(1.04) translateY(-6px);}
.price-card.popular .price-period{
  color:rgba(255,255,255,0.85);
}
.price-card.popular .price-billed{
  color:rgba(255,255,255,0.7);
}
[data-theme="light"] .price-card.popular .price-period{
  color:var(--sub);
}
[data-theme="light"] .price-card.popular .price-billed{
  color:var(--sub);
}
.popular-ribbon{
  position:absolute;
  top:16px;
  right:-36px;
  width:140px;
  text-align:center;
  background:linear-gradient(135deg,#fbbf24,#f59e0b);
  color:#0f172a;
  font-size:10px;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:1px;
  padding:6px 0;
  transform:rotate(45deg);
  box-shadow:0 4px 10px rgba(0,0,0,0.15);
  z-index:10;
}
.price-tier{font-size:14px;font-weight:700;color:#F8FAFC;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;}
[data-theme="light"] .price-tier{color:#6366f1;}
.price-amount{
  display:flex;align-items:baseline;gap:4px;margin-bottom:4px;
}
.price-currency{font-size:24px;font-weight:700;color:var(--text-bright);}
.price-value{font-size:52px;font-weight:800;color:var(--text-bright);line-height:1;}
.price-period{font-size:16px;color:var(--sub);font-weight:500;}
.price-billed{font-size:13px;color:var(--sub);margin-bottom:24px;min-height:20px;}
.price-features{list-style:none;margin-bottom:auto;padding-bottom:32px;}
.price-features li{
  display:flex;align-items:center;gap:10px;
  padding:10px 0;font-size:14px;color:var(--text);
  border-bottom:1px solid var(--border);
}
.price-features li:last-child{border-bottom:none;}
.price-features .check{color:#34d399;font-size:16px;flex-shrink:0;}
.price-features .cross{color:#64748b;font-size:16px;flex-shrink:0;}
.price-features li.disabled{color:var(--sub);text-decoration:line-through;opacity:.5;}
.price-cta{margin-top:auto;}

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════════════ */
.testimonials-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:24px;
  margin-top:56px;
}
.testimonial-card{
  padding:36px 28px;border-radius:20px;
  background:var(--surface);border:1px solid var(--border);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  transition:all .35s;
}
.testimonial-card:hover{transform:translateY(-6px);box-shadow:var(--card-shadow);}
.testimonial-stars{margin-bottom:20px;font-size:18px;letter-spacing:2px;}
.testimonial-text{
  font-size:15px;color:var(--text);line-height:1.8;
  margin-bottom:24px;font-style:italic;
}
.testimonial-author{display:flex;align-items:center;gap:14px;}
.testimonial-avatar{
  width:48px;height:48px;border-radius:50%;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  display:flex;align-items:center;justify-content:center;
  font-size:18px;font-weight:700;color:#fff;flex-shrink:0;
}
.testimonial-name{font-size:15px;font-weight:700;color:var(--text-bright);}
.testimonial-role{font-size:13px;color:var(--sub);}

/* ═══════════════════════════════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════════════════════════════ */
.cta-section{
  padding:100px 0;position:relative;overflow:hidden;
}
.cta-box{
  position:relative;z-index:2;
  background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.1));
  border:1px solid rgba(99,102,241,.25);
  border-radius:28px;padding:72px 40px;text-align:center;
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  overflow:hidden;
}
.cta-box::before{
  content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;
  background:radial-gradient(circle at 30% 50%,rgba(99,102,241,.12) 0%,transparent 50%),
             radial-gradient(circle at 70% 50%,rgba(139,92,246,.1) 0%,transparent 50%);
  animation:ctaSpin 15s linear infinite;pointer-events:none;
}
@keyframes ctaSpin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
.cta-box h2{
  font-size:clamp(28px,5vw,42px);font-weight:800;
  color:var(--text-bright);margin-bottom:16px;position:relative;z-index:2;
}
.cta-box p{
  font-size:18px;color:var(--sub);margin-bottom:36px;position:relative;z-index:2;
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */
.footer{
  background:var(--footer-bg);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border-top:1px solid var(--border);
  padding:72px 0 32px;color:#94a3b8;
}
.footer-grid{
  display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:40px;
  margin-bottom:48px;
}
.footer-brand-text{font-size:18px;font-weight:800;margin-bottom:12px;}
.footer-brand-desc{font-size:14px;color:#64748b;line-height:1.7;max-width:280px;}
.footer-col h4{
  font-size:13px;font-weight:700;text-transform:uppercase;
  letter-spacing:1px;color:#e2e8f0;margin-bottom:20px;
}
[data-theme="light"] .footer-col h4{color:#e2e8f0;}
.footer-col a{
  display:block;font-size:14px;color:#64748b;
  padding:6px 0;transition:color .2s;
}
.footer-col a:hover{color:#a5b4fc;}
.footer-social{
  display:flex;gap:12px;margin-top:20px;
}
.footer-social a{
  width:40px;height:40px;border-radius:10px;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);
  display:flex;align-items:center;justify-content:center;
  font-size:18px;transition:all .2s;
}
.footer-social a:hover{background:rgba(99,102,241,.2);border-color:rgba(99,102,241,.4);transform:translateY(-2px);}
.footer-bottom{
  border-top:1px solid rgba(255,255,255,.06);
  padding-top:24px;display:flex;align-items:center;
  justify-content:space-between;flex-wrap:wrap;gap:12px;
  font-size:13px;color:#475569;
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════ */
@media(max-width:1024px){
  .features-grid{grid-template-columns:repeat(2,1fr);}
  .pricing-grid{grid-template-columns:1fr;max-width:420px;margin-left:auto;margin-right:auto;}
  .price-card.popular{transform:none;}
  .price-card.popular:hover{transform:translateY(-6px);}
  .testimonials-grid{grid-template-columns:1fr;max-width:500px;margin-left:auto;margin-right:auto;}
  .footer-grid{grid-template-columns:1fr 1fr;gap:32px;}
}
@media(max-width:900px){
  .nav-links{display:none;}
  .hamburger{display:flex;}
  .steps-wrapper{flex-direction:column;align-items:center;gap:40px;}
  .step-connector{display:none!important;}
  .step-card{max-width:400px;}
  .stats-bar-inner{grid-template-columns:repeat(2,1fr);}
  .stat-item:nth-child(2){border-right:none;}
  .stat-item:nth-child(3),.stat-item:nth-child(4){border-top:1px solid var(--border);}
}
@media(max-width:640px){
  .features-grid{grid-template-columns:1fr;}
  .hero-title{letter-spacing:-0.5px;}
  .hero-buttons{flex-direction:column;width:100%;}
  .hero-buttons .btn-primary,.hero-buttons .btn-outline{width:100%;}
  .stats-bar-inner{grid-template-columns:1fr 1fr;}
  .footer-grid{grid-template-columns:1fr;}
  .footer-bottom{flex-direction:column;text-align:center;}
  .cta-box{padding:48px 24px;}
  .section{padding:72px 0;}
}
@media(max-width:400px){
  .stats-bar-inner{grid-template-columns:1fr;}
  .stat-item{border-right:none;border-bottom:1px solid var(--border);}
  .stat-item:last-child{border-bottom:none;}
}
`}} />

      </Head>
      <div className="home-page-container">


        {/*  ═══════════════════════════════════════════════════════════════
     NAVIGATION
     ═══════════════════════════════════════════════════════════════  */}
        <nav className="navbar" id="navbar">
          <div className="nav-inner">
            <a href="./" className="nav-brand">
              <div className="nav-logo">🛡️</div>
              <span className="nav-brand-text gradient-text">Website Health Monitor</span>
            </a>

            <ul className="nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>

            <div className="nav-actions">
              <button className="theme-toggle" id="themeToggle" onClick={toggleTheme} aria-label="Toggle theme">
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <a href="/login" className="nav-login">Login</a>
              <a href="/register?plan=pro_monthly" className="nav-cta">Get Started</a>
              <button className="hamburger" id="hamburger" onClick={toggleMobileMenu} aria-label="Menu">
                <span></span><span></span><span></span>
              </button>
            </div>
          </div>
        </nav>

        {/*  Mobile Menu  */}
        <div className="mobile-overlay" id="mobileOverlay" onClick={closeMobileMenu}></div>
        <div className="mobile-menu" id="mobileMenu">
          <a href="#features" onClick={closeMobileMenu}>🌐 Features</a>
          <a href="#how-it-works" onClick={closeMobileMenu}>⚙️ How It Works</a>
          <a href="#pricing" onClick={closeMobileMenu}>💳 Pricing</a>
          <a href="#contact" onClick={closeMobileMenu}>📬 Contact</a>
          <div className="mobile-actions">
            <a href="/login" className="btn-outline btn-sm" style={{ textAlign: 'center' }}>Login</a>
            <a href="/register?plan=pro_monthly" className="btn-primary btn-sm" onClick={closeMobileMenu} style={{ textAlign: 'center' }}>Get Started</a>
          </div>
        </div>

        {/*  ═══════════════════════════════════════════════════════════════
     HERO SECTION
     ═══════════════════════════════════════════════════════════════  */}
        <section className="hero">
          <div className="hero-bg">
            <div className="hero-orb hero-orb-1"></div>
            <div className="hero-orb hero-orb-2"></div>
            <div className="hero-orb hero-orb-3"></div>
            <div className="hero-orb hero-orb-4"></div>
          </div>

          <div className="container" style={{ width: '100%' }}>
            <div className="hero-content">
              <div className="hero-badge">
                <span className="live-dot"></span>
                <span>Real-time Monitoring Active</span>
              </div>

              <h1 className="hero-title">
                Monitor Your Websites.<br />
                <span className="highlight">Stay Ahead of Downtime.</span>
              </h1>

              <p className="hero-subtitle">
                Real-time uptime monitoring, instant alerts, and comprehensive analytics. Keep your websites running 24/7.
              </p>

              <div className="hero-buttons">
                <a href="/register?plan=pro_monthly" className="btn-primary btn-lg">
                  🚀 Start Free Trial
                </a>
                <a href="#how-it-works" className="btn-outline btn-lg">
                  ▶ View Demo
                </a>
              </div>
            </div>

            {/*  Stats Bar  */}
            <div className="stats-bar reveal">
              <div className="glass stats-bar-inner">
                <div className="stat-item">
                  <div className="stat-value green">99.9%</div>
                  <div className="stat-label">Uptime Guarantee</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value indigo">500+</div>
                  <div className="stat-label">Websites Monitored</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value blue">24/7</div>
                  <div className="stat-label">Alerts & Monitoring</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value amber">&lt; 30s</div>
                  <div className="stat-label">Detection Time</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  ═══════════════════════════════════════════════════════════════
     FEATURES SECTION
     ═══════════════════════════════════════════════════════════════  */}
        <section className="section" id="features">
          <div className="container">
            <div className="text-center reveal">
              <div className="section-label">✦ Features</div>
              <h2 className="section-title">Everything You Need to<br /><span className="gradient-text">Stay Online</span></h2>
              <p className="section-sub mx-auto">Powerful monitoring tools designed to keep your websites running smoothly and your team informed.</p>
            </div>

            <div className="features-grid">
              <div className="feature-card reveal">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,.35)' }}>🌐</div>
                <h3>Uptime Monitoring</h3>
                <p>Track website availability 24/7 with checks every 30 seconds. Get notified the moment something goes wrong.</p>
              </div>
              <div className="feature-card reveal">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 24px rgba(245,158,11,.35)' }}>⚡</div>
                <h3>Instant Alerts</h3>
                <p>Get notified via Email, SMS, Slack, and WhatsApp within seconds of detecting an issue.</p>
              </div>
              <div className="feature-card reveal">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 24px rgba(16,185,129,.35)' }}>📊</div>
                <h3>Analytics Dashboard</h3>
                <p>Detailed response time charts, uptime percentage, and trend analysis to optimize performance.</p>
              </div>
              <div className="feature-card reveal">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 8px 24px rgba(239,68,68,.35)' }}>🔒</div>
                <h3>SSL Certificate Monitor</h3>
                <p>Get alerted before your SSL certificates expire and avoid security warnings for visitors.</p>
              </div>
              <div className="feature-card reveal">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', boxShadow: '0 8px 24px rgba(6,182,212,.35)' }}>🌍</div>
                <h3>Global Monitoring</h3>
                <p>Check from multiple geographic locations worldwide for accurate, region-specific insights.</p>
              </div>
              <div className="feature-card reveal">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg,#8b5cf6,#a855f7)', boxShadow: '0 8px 24px rgba(139,92,246,.35)' }}>🔗</div>
                <h3>API & Webhooks</h3>
                <p>Integrate with your existing tools and workflows using our powerful REST API and webhook system.</p>
              </div>
            </div>
          </div>
        </section>

        {/*  ═══════════════════════════════════════════════════════════════
     HOW IT WORKS
     ═══════════════════════════════════════════════════════════════  */}
        <section className="section" id="how-it-works">
          <div className="container">
            <div className="text-center reveal">
              <div className="section-label">✦ How It Works</div>
              <h2 className="section-title">Up and Running in<br /><span className="gradient-text">3 Simple Steps</span></h2>
              <p className="section-sub mx-auto">Getting started is fast and effortless. No complicated setup, no credit card required.</p>
            </div>

            <div className="steps-wrapper">
              <div className="step-card reveal">
                <div className="step-number">1</div>
                <div className="step-connector"></div>
                <div className="step-icon">🌐</div>
                <h3>Add Your Domains</h3>
                <p>Enter your website URLs and configure check intervals. Our system starts monitoring within seconds.</p>
              </div>
              <div className="step-card reveal">
                <div className="step-number">2</div>
                <div className="step-connector"></div>
                <div className="step-icon">🔔</div>
                <h3>Configure Alerts</h3>
                <p>Set up notification channels and alert thresholds. Choose Email, SMS, Slack, or WhatsApp.</p>
              </div>
              <div className="step-card reveal">
                <div className="step-number">3</div>
                <div className="step-icon">📊</div>
                <h3>Stay Informed</h3>
                <p>Receive real-time alerts and view detailed analytics. Know exactly when and why issues occur.</p>
              </div>
            </div>
          </div>
        </section>

        {/*  ═══════════════════════════════════════════════════════════════
     PRICING SECTION
     ═══════════════════════════════════════════════════════════════  */}
        <section className="section" id="pricing">
          <div className="container">
            <div className="text-center reveal">
              <div className="section-label">✦ Pricing</div>
              <h2 className="section-title">Simple, Transparent<br /><span className="gradient-text">Pricing</span></h2>
              <p className="section-sub mx-auto">Choose the plan that fits your needs.

                All plans include a {trialDays || 0}-day free trial.

                Start monitoring your websites instantly.

              </p>
            </div>

            {/*  Toggle  */}
            <div className="pricing-toggle reveal">
              <span id="monthlyLabel" className="active">Monthly</span>
              <div className="toggle-switch" id="pricingToggle" onClick={togglePricing}>
                <div className="toggle-knob"></div>
              </div>
              <span id="yearlyLabel">Yearly</span>
              <span className="yearly-badge">Save 20%</span>
            </div>

            <div className="pricing-grid">
              {/*  Starter  */}
              <div className="price-card glass reveal">
                <div className="price-tier">Starter</div>
                <div className="price-amount">
                  <span className="price-currency">{currencySymbol}</span>
                  <span className="price-value" data-monthly="9" data-yearly="7">9</span>
                  <span className="price-period">/mo</span>
                </div>
                <div className="price-billed" data-monthly="" data-yearly={`Billed ${currencySymbol}84/year`}>
                  &nbsp;
                </div>
                <ul className="price-features">
                  <li><span className="check">✓</span> 10 Websites</li>
                  <li><span className="check">✓</span> 5-minute check interval</li>
                  <li><span className="check">✓</span> Email alerts</li>
                  <li><span className="check">✓</span> 30-day log retention</li>
                  <li className="disabled"><span className="cross">✕</span> SSL monitoring</li>
                  <li className="disabled"><span className="cross">✕</span> API access</li>
                </ul>
                <div className="price-cta">
                  <a href={user ? `/payment/checkout?plan=starter_monthly` : `/register?plan=starter_monthly`} id="btn-starter" className="btn-outline" style={{ width: '100%', display: 'inline-block', textAlign: 'center', boxSizing: 'border-box' }}>
                    {user ? 'Upgrade to Starter' : 'Get Started'}
                  </a>
                </div>
              </div>

              {/*  Pro  */}
              <div className="price-card popular glass reveal">
                <div className="popular-ribbon">Most Popular</div>
                <div className="price-tier">Pro</div>
                <div className="price-amount">
                  <span className="price-currency">{currencySymbol}</span>
                  <span className="price-value" data-monthly="29" data-yearly="23">29</span>
                  <span className="price-period">/mo</span>
                </div>
                <div className="price-billed" data-monthly="" data-yearly={`Billed ${currencySymbol}276/year`}>
                  &nbsp;
                </div>
                <ul className="price-features">
                  <li><span className="check">✓</span> 50 Websites</li>
                  <li><span className="check">✓</span> 1-minute check interval</li>
                  <li><span className="check">✓</span> Email + SMS + Slack</li>
                  <li><span className="check">✓</span> SSL monitoring</li>
                  <li><span className="check">✓</span> 90-day log retention</li>
                  <li><span className="check">✓</span> API access</li>
                </ul>
                <div className="price-cta">
                  <a href={user ? `/payment/checkout?plan=pro_monthly` : `/register?plan=pro_monthly`} id="btn-pro" className="btn-primary" style={{ width: '100%', display: 'inline-block', textAlign: 'center', boxSizing: 'border-box' }}>
                    {user ? 'Upgrade to Pro' : 'Get Started'}
                  </a>
                </div>

              </div>

              {/*  Enterprise  */}
              <div className="price-card glass reveal">
                <div className="price-tier">Enterprise</div>
                <div className="price-amount">
                  <span className="price-currency">{currencySymbol}</span>
                  <span className="price-value" data-monthly="79" data-yearly="63">79</span>
                  <span className="price-period">/mo</span>
                </div>
                <div className="price-billed" data-monthly="" data-yearly={`Billed ${currencySymbol}756/year`}>
                  &nbsp;
                </div>
                <ul className="price-features">
                  <li><span className="check">✓</span> Unlimited websites</li>
                  <li><span className="check">✓</span> 30-second check interval</li>
                  <li><span className="check">✓</span> All notification channels</li>
                  <li><span className="check">✓</span> Priority support</li>
                  <li><span className="check">✓</span> 1-year log retention</li>
                  <li><span className="check">✓</span> Custom integrations</li>
                </ul>
                <div className="price-cta">
                  <a href={user ? `/payment/checkout?plan=enterprise_monthly` : `/register?plan=enterprise_monthly`} id="btn-enterprise" className="btn-outline" style={{ width: '100%', display: 'inline-block', textAlign: 'center', boxSizing: 'border-box' }}>
                    {user ? 'Upgrade to Enterprise' : 'Get Started'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  ===============================================================
     TESTIMONIALS SECTION
     ===============================================================  */}
        <section className="section" id="testimonials">
          <div className="container">
            <div className="text-center reveal">
              <div className="section-label">✦ Testimonials</div>
              <h2 className="section-title">Loved by Teams<br /><span className="gradient-text">Worldwide</span></h2>
              <p className="section-sub mx-auto">See what our customers have to say about Website Health Monitor.</p>
            </div>

            <div className="testimonials-grid">
              <div className="testimonial-card reveal">
                <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                <p className="testimonial-text">"Saved us from 3 hours of unnoticed downtime. The alerts are lightning fast!"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>SC</div>
                  <div>
                    <div className="testimonial-name">Sarah Chen</div>
                    <div className="testimonial-role">CTO at TechFlow</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card reveal">
                <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                <p className="testimonial-text">"The dashboard is beautiful and the analytics help us optimize performance."</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>MR</div>
                  <div>
                    <div className="testimonial-name">Marcus Rodriguez</div>
                    <div className="testimonial-role">DevOps Lead</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card reveal">
                <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                <p className="testimonial-text">"Best monitoring tool we've used. Setup took 5 minutes."</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>PS</div>
                  <div>
                    <div className="testimonial-name">Priya Sharma</div>
                    <div className="testimonial-role">Founder at CloudBase</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  ===============================================================
     CTA SECTION
     ===============================================================  */}
        <section className="cta-section" id="contact">
          <div className="container">
            <div className="cta-box reveal">
              <h2>Ready to Keep Your Websites<br /><span className="gradient-text">Running?</span></h2>
              <p>

                Start your {trialDays || 0}-day free trial. No credit card required.

                Get started today. No credit card required.

              </p>
              <a href="/register?plan=pro_monthly" className="btn-primary btn-lg" style={{ position: 'relative', zIndex: '2' }}>
                🚀 Get Started Free
              </a>
            </div>
          </div>
        </section>

        {/*  ===============================================================
     FOOTER
     ===============================================================  */}
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-col">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div className="nav-logo" style={{ width: '36px', height: '36px', fontSize: '16px', borderRadius: '10px' }}>🛡️</div>
                  <span className="footer-brand-text" style={{ color: '#e2e8f0' }}>Website Health Monitor</span>
                </div>
                <p className="footer-brand-desc">Real-time website monitoring and alerting platform. Keep your websites running 24/7 with instant notifications and comprehensive analytics.</p>
                <div className="footer-social">
                  <a href="#" aria-label="X (Twitter)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                  <a href="#" aria-label="GitHub">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" /></svg>
                  </a>
                  <a href="#" aria-label="LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  </a>
                  <a href="#" aria-label="Discord">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
                  </a>
                </div>
              </div>
              <div className="footer-col">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#">Integrations</a>
                <a href="#">Changelog</a>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
                <a href="#">Press</a>
              </div>
              <div className="footer-col">
                <h4>Support</h4>
                <a href="#">Documentation</a>
                <a href="#">Status Page</a>
                <a href="#contact">Contact Us</a>
                <a href="#">FAQ</a>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Security</a>
                <a href="#">GDPR</a>
              </div>
            </div>

            <div className="footer-bottom">
              <span>&copy; Website Health Monitor. All rights reserved.</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 7px #10b981', display: 'inline-block' }}></span>
                All systems operational
              </span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
