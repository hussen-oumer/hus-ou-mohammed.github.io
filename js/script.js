// Cursor spotlight — cyan in hero, blue-purple elsewhere
const spotlight = document.getElementById('cursorSpotlight');
if (spotlight && !('ontouchstart' in window)) {
    const heroEl = document.querySelector('.hero');

    let cx = -999, cy = -999, tx = -999, ty = -999;

    // smooth lerp animation
    function lerpSpotlight() {
        cx += (tx - cx) * 0.1;
        cy += (ty - cy) * 0.1;
        spotlight.style.setProperty('--x', cx + 'px');
        spotlight.style.setProperty('--y', cy + 'px');

        // switch color: cyan in hero, blue-purple below
        const heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 0;
        if (cy < heroBottom) {
            spotlight.style.setProperty('--spot-color', 'rgba(56, 189, 248, 0.08)');
        } else {
            spotlight.style.setProperty('--spot-color', 'rgba(99, 102, 241, 0.07)');
        }

        requestAnimationFrame(lerpSpotlight);
    }

    document.addEventListener('mousemove', (e) => {
        tx = e.clientX;
        ty = e.clientY;
        spotlight.style.opacity = '1';
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        spotlight.style.opacity = '0';
    });

    requestAnimationFrame(lerpSpotlight);
}

// Mobile menu
const menuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}
document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu && mobileMenu.classList.remove('open'));
});

// Navbar scroll state
const navbar = document.querySelector('.navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });
}

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
    });
}, 100);

// ── Full-page animated star field ──────────────────────────────────────────
(function () {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, stars, mouse = { x: 0, y: 0 };

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function mkStars() {
        const count = Math.floor((W * H) / 5500);
        stars = Array.from({ length: count }, () => ({
            x:     Math.random() * W,
            y:     Math.random() * H,
            r:     Math.random() * 1.3 + 0.15,
            base:  Math.random() * 0.55 + 0.05,
            speed: Math.random() * 0.0008 + 0.0002,
            phase: Math.random() * Math.PI * 2,
            px:    (Math.random() - 0.5) * 0.06,  // parallax factor
            py:    (Math.random() - 0.5) * 0.06,
        }));
    }

    function draw(t) {
        ctx.clearRect(0, 0, W, H);

        // connection lines between nearby stars (constellation feel)
        const LINK_DIST = 90;
        ctx.strokeStyle = 'rgba(180,220,255,0.04)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const dx = stars[i].x - stars[j].x;
                const dy = stars[i].y - stars[j].y;
                if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(stars[i].x + mouse.x * stars[i].px, stars[i].y + mouse.y * stars[i].py);
                    ctx.lineTo(stars[j].x + mouse.x * stars[j].px, stars[j].y + mouse.y * stars[j].py);
                    ctx.stroke();
                }
            }
        }

        // draw stars
        stars.forEach(s => {
            const alpha = s.base * (0.4 + 0.6 * Math.sin(t * s.speed + s.phase));
            const sx = s.x + mouse.x * s.px;
            const sy = s.y + mouse.y * s.py;

            // soft glow for brighter stars
            if (s.r > 0.9) {
                const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 3);
                grd.addColorStop(0, `rgba(180,220,255,${alpha * 0.4})`);
                grd.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.beginPath();
                ctx.arc(sx, sy, s.r * 3, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,225,255,${alpha})`;
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }

    // mouse parallax
    document.addEventListener('mousemove', e => {
        mouse.x = (e.clientX / W - 0.5) * W * 0.04;
        mouse.y = (e.clientY / H - 0.5) * H * 0.04;
    }, { passive: true });

    window.addEventListener('resize', () => { resize(); mkStars(); }, { passive: true });

    resize();
    mkStars();
    requestAnimationFrame(draw);
})();
