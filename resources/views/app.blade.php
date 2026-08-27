<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <script>
            // Prevent BFCache from showing authenticated pages after logout
            window.addEventListener('pageshow', function (event) {
                if (event.persisted) {
                    window.location.reload();
                }
            });
        </script>

        <!--
            CRITICAL: Hide #app and show skeleton placeholder until JS is ready.
            Prevents Flash of Unstyled Content (FOUC).
        -->
        <style>
            /* Hide the app root so raw HTML never flashes */
            #app {
                opacity: 0;
                visibility: hidden;
            }
            #app.ready {
                opacity: 1;
                visibility: visible;
                transition: opacity .3s ease;
            }

            /* ═══ Skeleton Preloader ═══ */
            #preloader {
                position: fixed;
                inset: 0;
                z-index: 99999;
                background: linear-gradient(135deg, #0f0c29, #1a1a3e, #0d1b2a);
                transition: opacity .4s ease, visibility .4s ease;
                overflow: hidden;
            }
            #preloader.fade-out {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
            }

            /* Shimmer animation */
            @keyframes ph-shimmer {
                0% { background-position: -400px 0; }
                100% { background-position: 400px 0; }
            }
            .ph-item {
                background: rgba(255,255,255,.03);
                animation-fill-mode: forwards;
            }
            .ph-row {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-bottom: 12px;
            }
            .ph-col {
                flex: 1;
            }
            .ph-el {
                background: linear-gradient(90deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.08) 40%, rgba(255,255,255,.04) 80%);
                background-size: 800px 100%;
                animation: ph-shimmer 1.5s ease-in-out infinite;
                border-radius: 8px;
            }

            /* Skeleton Navbar */
            .sk-navbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 40px;
                border-bottom: 1px solid rgba(255,255,255,.06);
            }
            .sk-nav-logo {
                width: 40px; height: 40px; border-radius: 10px;
            }
            .sk-nav-links {
                display: flex; gap: 24px;
            }
            .sk-nav-link {
                width: 70px; height: 14px; border-radius: 6px;
            }
            .sk-nav-btn {
                width: 100px; height: 36px; border-radius: 10px;
            }

            /* Skeleton Hero */
            .sk-hero {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 80px 40px 60px;
                gap: 20px;
            }
            .sk-hero-badge {
                width: 180px; height: 28px; border-radius: 14px;
            }
            .sk-hero-title {
                width: 60%; height: 40px; border-radius: 10px;
            }
            .sk-hero-title2 {
                width: 40%; height: 40px; border-radius: 10px;
            }
            .sk-hero-sub {
                width: 50%; height: 16px; border-radius: 6px;
            }
            .sk-hero-sub2 {
                width: 35%; height: 16px; border-radius: 6px;
            }
            .sk-hero-btns {
                display: flex; gap: 16px; margin-top: 12px;
            }
            .sk-hero-btn {
                width: 160px; height: 48px; border-radius: 14px;
            }

            /* Skeleton Stats */
            .sk-stats {
                display: flex;
                justify-content: center;
                gap: 48px;
                padding: 40px;
            }
            .sk-stat {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            .sk-stat-num {
                width: 80px; height: 32px; border-radius: 8px;
            }
            .sk-stat-label {
                width: 100px; height: 12px; border-radius: 6px;
            }

            /* Skeleton Cards */
            .sk-cards {
                display: flex;
                justify-content: center;
                gap: 24px;
                padding: 20px 40px 60px;
                flex-wrap: wrap;
            }
            .sk-card {
                width: 280px;
                background: rgba(255,255,255,.03);
                border: 1px solid rgba(255,255,255,.06);
                border-radius: 20px;
                padding: 32px 24px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .sk-card-icon {
                width: 48px; height: 48px; border-radius: 14px;
            }
            .sk-card-title {
                width: 70%; height: 18px; border-radius: 6px;
            }
            .sk-card-text {
                width: 100%; height: 12px; border-radius: 6px;
            }
            .sk-card-text2 {
                width: 80%; height: 12px; border-radius: 6px;
            }

            /* Section title skeleton */
            .sk-section-title {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                padding: 40px 40px 20px;
            }
            .sk-sec-badge {
                width: 120px; height: 22px; border-radius: 11px;
            }
            .sk-sec-heading {
                width: 300px; height: 28px; border-radius: 8px;
            }
            .sk-sec-sub {
                width: 220px; height: 14px; border-radius: 6px;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .sk-nav-links { display: none; }
                .sk-hero-title { width: 85%; height: 28px; }
                .sk-hero-title2 { width: 65%; height: 28px; }
                .sk-hero-sub { width: 80%; }
                .sk-hero-btns { flex-direction: column; }
                .sk-hero-btn { width: 200px; }
                .sk-stats { gap: 20px; }
                .sk-cards { flex-direction: column; align-items: center; }
                .sk-card { width: 90%; max-width: 340px; }
            }
        </style>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        <!-- Skeleton Placeholder Preloader -->
        <div id="preloader">
            <!-- Navbar skeleton -->
            <div class="sk-navbar">
                <div class="ph-el sk-nav-logo"></div>
                <div class="sk-nav-links">
                    <div class="ph-el sk-nav-link"></div>
                    <div class="ph-el sk-nav-link"></div>
                    <div class="ph-el sk-nav-link"></div>
                    <div class="ph-el sk-nav-link"></div>
                </div>
                <div class="ph-el sk-nav-btn"></div>
            </div>

            <!-- Hero skeleton -->
            <div class="sk-hero">
                <div class="ph-el sk-hero-badge"></div>
                <div class="ph-el sk-hero-title"></div>
                <div class="ph-el sk-hero-title2"></div>
                <div class="ph-el sk-hero-sub"></div>
                <div class="ph-el sk-hero-sub2"></div>
                <div class="sk-hero-btns">
                    <div class="ph-el sk-hero-btn"></div>
                    <div class="ph-el sk-hero-btn"></div>
                </div>
            </div>

            <!-- Stats skeleton -->
            <div class="sk-stats">
                <div class="sk-stat">
                    <div class="ph-el sk-stat-num"></div>
                    <div class="ph-el sk-stat-label"></div>
                </div>
                <div class="sk-stat">
                    <div class="ph-el sk-stat-num"></div>
                    <div class="ph-el sk-stat-label"></div>
                </div>
                <div class="sk-stat">
                    <div class="ph-el sk-stat-num"></div>
                    <div class="ph-el sk-stat-label"></div>
                </div>
                <div class="sk-stat">
                    <div class="ph-el sk-stat-num"></div>
                    <div class="ph-el sk-stat-label"></div>
                </div>
            </div>

            <!-- Section title skeleton -->
            <div class="sk-section-title">
                <div class="ph-el sk-sec-badge"></div>
                <div class="ph-el sk-sec-heading"></div>
                <div class="ph-el sk-sec-sub"></div>
            </div>

            <!-- Cards skeleton -->
            <div class="sk-cards">
                <div class="sk-card">
                    <div class="ph-el sk-card-icon"></div>
                    <div class="ph-el sk-card-title"></div>
                    <div class="ph-el sk-card-text"></div>
                    <div class="ph-el sk-card-text2"></div>
                </div>
                <div class="sk-card">
                    <div class="ph-el sk-card-icon"></div>
                    <div class="ph-el sk-card-title"></div>
                    <div class="ph-el sk-card-text"></div>
                    <div class="ph-el sk-card-text2"></div>
                </div>
                <div class="sk-card">
                    <div class="ph-el sk-card-icon"></div>
                    <div class="ph-el sk-card-title"></div>
                    <div class="ph-el sk-card-text"></div>
                    <div class="ph-el sk-card-text2"></div>
                </div>
            </div>
        </div>

        @inertia
    </body>
</html>
