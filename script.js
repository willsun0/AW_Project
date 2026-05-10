document.addEventListener('DOMContentLoaded', () => {

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a').forEach(link => {
        const href = link.getAttribute('href');
        const page = href.split('/').pop();
        if (page === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const targetId = anchor.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const fadeElements = document.querySelectorAll('.reveal, .stat-strip, .pill-badge, .watermark, .exhibit-card, .spectrum-section, .cta-prompt, .split-panel, .parallel-timeline, .hero-text, .hero-decorative');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        fadeElements.forEach(el => observer.observe(el));
    } else {
        fadeElements.forEach(el => el.classList.add('visible'));
    }

    const backTop = document.querySelector('.back-top');
    if (backTop) {
        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 300) {
                        backTop.classList.add('visible');
                    } else {
                        backTop.classList.remove('visible');
                    }
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        });
        backTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const cycleEl = document.getElementById('cycling-word');
    if (cycleEl) {
        const words = ["Propaganda.", "Control.", "Image.", "Authority."];
        let wordIdx = 0;
        let charIdx = 0;
        let deleting = false;
        const typeSpeed = 80;
        const deleteSpeed = 40;
        const pauseTime = 2000;

        function type() {
            const currentWord = words[wordIdx];
            if (!deleting) {
                cycleEl.textContent = currentWord.slice(0, charIdx + 1);
                charIdx++;
                if (charIdx === currentWord.length) {
                    setTimeout(() => { deleting = true; type(); }, pauseTime);
                } else {
                    setTimeout(type, typeSpeed);
                }
            } else {
                cycleEl.textContent = currentWord.slice(0, charIdx - 1);
                charIdx--;
                if (charIdx === 0) {
                    deleting = false;
                    wordIdx = (wordIdx + 1) % words.length;
                    setTimeout(type, 300);
                } else {
                    setTimeout(type, deleteSpeed);
                }
            }
        }
        type();
    }

    document.querySelectorAll('.marquee-strip').forEach(strip => {
        strip.addEventListener('mouseenter', () => {
            const inner = strip.querySelector('.marquee-inner');
            if (inner) inner.style.animationPlayState = 'paused';
        });
        strip.addEventListener('mouseleave', () => {
            const inner = strip.querySelector('.marquee-inner');
            if (inner) inner.style.animationPlayState = 'running';
        });
    });

});
