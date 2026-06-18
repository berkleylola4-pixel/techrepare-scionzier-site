/**
 * TechRépare Scionzier - Scripts principaux
 * Version: 2.0.0
 */

(function () {
    'use strict';

    const CONFIG = {
        formspreeEndpoint: 'https://formspree.io/f/FORM_ID'
    };

    // LOADER
    function initLoader() {
        const loader = document.getElementById('loader');
        if (!loader) return;
        window.addEventListener('load', function () {
            setTimeout(function () {
                loader.classList.add('hidden');
            }, 1800);
        });
    }

    // NAV SCROLL
    function initNavScroll() {
        const nav = document.getElementById('mainNav');
        if (!nav) return;
        window.addEventListener('scroll', function () {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        });
    }

    // MOBILE MENU
    function initMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');
        if (!hamburger || !mobileMenu) return;

        window.toggleMenu = function () {
            const isOpen = mobileMenu.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        };

        window.closeMenu = function () {
            mobileMenu.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
        };
    }

    // LIGHTBOX
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lbImg = document.getElementById('lbImg');
        if (!lightbox || !lbImg) return;

        window.openLightbox = function (src) {
            lbImg.src = src;
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };

        window.closeLightbox = function () {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            lbImg.src = '';
        };

        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) {
                closeLightbox();
            }
        });
    }

    // FAQ ACCORDION
    function initFAQ() {
        const questions = document.querySelectorAll('.faq-question');
        if (!questions.length) return;

        questions.forEach(function (question) {
            question.addEventListener('click', function () {
                const item = question.closest('.faq-item');
                const isActive = item.classList.contains('active');

                document.querySelectorAll('.faq-item').forEach(function (i) {
                    i.classList.remove('active');
                    const btn = i.querySelector('.faq-question');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                });

                if (!isActive) {
                    item.classList.add('active');
                    question.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    // SMOOTH SCROLL
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href.length <= 1) return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }
            });
        });
    }

    // FORM SUBMISSION
    function initContactForm() {
        const form = document.querySelector('.contact-form-el');
        if (!form) return;

        const statusEl = form.querySelector('.form-status');

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn ? submitBtn.innerHTML : '';

            if (CONFIG.formspreeEndpoint.indexOf('FORM_ID') > -1) {
                if (statusEl) {
                    statusEl.className = 'form-status success';
                    statusEl.textContent = 'Merci ! Votre demande a bien été envoyée. Nous vous recontactons sous 2 heures.';
                }
                form.reset();
                return;
            }

            if (statusEl) {
                statusEl.className = 'form-status loading';
                statusEl.textContent = 'Envoi en cours...';
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Envoi en cours...';
            }

            fetch(CONFIG.formspreeEndpoint, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            })
                .then(function (response) {
                    if (response.ok) {
                        if (statusEl) {
                            statusEl.className = 'form-status success';
                            statusEl.textContent = 'Merci ! Votre demande a bien été envoyée. Nous vous recontactons sous 2 heures.';
                        }
                        form.reset();
                    } else {
                        return response.json().then(function (data) {
                            throw new Error(data.error || 'Erreur lors de l\'envoi');
                        });
                    }
                })
                .catch(function (error) {
                    if (statusEl) {
                        statusEl.className = 'form-status error';
                        statusEl.textContent = 'Une erreur est survenue : ' + error.message + '. Veuillez nous appeler directement.';
                    }
                })
                .finally(function () {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                });
        });
    }

    // REVEAL ON SCROLL
    function initRevealAnimations() {
        const reveals = document.querySelectorAll('.reveal, .reveal-l, .reveal-r');
        if (!reveals.length) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            reveals.forEach(function (el) {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('on');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

        reveals.forEach(function (el) {
            observer.observe(el);
        });
    }

    // PARALLAX HERO
    function initParallaxHero() {
        const heroBg = document.getElementById('heroBg');
        if (!heroBg) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        window.addEventListener('scroll', function () {
            heroBg.style.transform = 'translateY(' + (window.scrollY * 0.35) + 'px) scale(1)';
        });
    }

    // Initialisation
    document.addEventListener('DOMContentLoaded', function () {
        initLoader();
        initNavScroll();
        initMobileMenu();
        initLightbox();
        initFAQ();
        initSmoothScroll();
        initContactForm();
        initRevealAnimations();
        initParallaxHero();
    });
})();
