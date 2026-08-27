import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { router } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Dismiss the preloader and reveal the app
function revealApp() {
    // Fade out preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.remove(), 500);
    }

    // Reveal app content (was hidden to prevent FOUC)
    const appEl = document.getElementById('app');
    if (appEl) {
        appEl.classList.add('ready');
    }
}

// Inertia navigation progress bar
let progressBar = null;

function createProgressBar() {
    if (progressBar) return;
    progressBar = document.createElement('div');
    progressBar.id = 'inertia-progress';
    progressBar.innerHTML = '<div class="inertia-progress-bar"></div>';
    document.body.appendChild(progressBar);

    if (!document.getElementById('inertia-progress-styles')) {
        const style = document.createElement('style');
        style.id = 'inertia-progress-styles';
        style.textContent = `
            #inertia-progress {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                z-index: 999999;
                pointer-events: none;
            }
            .inertia-progress-bar {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #6366f1, #a855f7, #6366f1);
                background-size: 200% 100%;
                animation: inertia-shimmer 1.5s ease-in-out infinite;
                border-radius: 0 2px 2px 0;
                box-shadow: 0 0 10px rgba(99,102,241,.6), 0 0 5px rgba(168,85,247,.4);
                transition: width .3s ease;
            }
            @keyframes inertia-shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

function startProgress() {
    createProgressBar();
    const bar = progressBar?.querySelector('.inertia-progress-bar');
    if (bar) {
        bar.style.width = '0%';
        bar.style.opacity = '1';
        requestAnimationFrame(() => {
            bar.style.width = '30%';
            setTimeout(() => { bar.style.width = '60%'; }, 200);
            setTimeout(() => { bar.style.width = '80%'; }, 500);
        });
    }
}

function finishProgress() {
    const bar = progressBar?.querySelector('.inertia-progress-bar');
    if (bar) {
        bar.style.width = '100%';
        setTimeout(() => {
            bar.style.opacity = '0';
            setTimeout(() => { bar.style.width = '0%'; }, 300);
        }, 200);
    }
}

router.on('start', startProgress);
router.on('finish', finishProgress);

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);

        // Wait for next frame so the DOM is painted, then reveal
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                revealApp();
            });
        });
    },
    progress: false,
});
