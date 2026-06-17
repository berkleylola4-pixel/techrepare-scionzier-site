/**
 * TechRépare Scionzier - Scripts principaux
 * Version: 1.0.0
 */

(function () {
    'use strict';

    const CONFIG = {
        formspreeEndpoint: 'https://formspree.io/f/FORM_ID'
    };

    // FAQ Accordion
    function initFAQ() {
        const questions = document.querySelectorAll('.faq-question');

        questions.forEach(function (question) {
            question.addEventListener('click', function () {
                const item = question.closest('.faq-item');
                const isActive = item.classList.contains('active');

                // Fermer tous les autres
                document.querySelectorAll('.faq-item').forEach(function (i) {
                    i.classList.remove('active');
                    const btn = i.querySelector('.faq-question');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                });

                // Ouvrir celui-ci si pas déjà actif
                if (!isActive) {
                    item.classList.add('active');
                    question.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    // Header sticky effect
    function initHeaderScroll() {
        const header = document.querySelector('header');
        if (!header) return;

        let ticking = false;

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    if (window.pageYOffset > 100) {
                        header.style.boxShadow = '0 5px 30px rgba(0,0,0,0.1)';
                    } else {
                        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.05)';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // Mobile menu
    function initMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const mobileNav = document.querySelector('.mobile-nav');

        if (!toggle || !mobileNav) return;

        toggle.addEventListener('click', function () {
            const isOpen = mobileNav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Fermer le menu au clic sur un lien
        mobileNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileNav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Smooth scroll for anchor links
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

    // Form submission
    function initContactForm() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        // Si Formspree n'est pas configuré, on désactive l'envoi AJAX
        if (CONFIG.formspreeEndpoint.indexOf('FORM_ID') > -1) {
            console.warn('Formspree FORM_ID non configuré. Le formulaire affichera un message local.');
        }

        const statusEl = document.createElement('div');
        statusEl.className = 'form-status';
        statusEl.setAttribute('role', 'status');
        statusEl.setAttribute('aria-live', 'polite');
        form.insertBefore(statusEl, form.firstChild);

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = form.querySelector('.form-submit');
            const originalText = submitBtn ? submitBtn.textContent : '';

            if (CONFIG.formspreeEndpoint.indexOf('FORM_ID') > -1) {
                showStatus(statusEl, 'success', 'Merci ! Votre demande a bien été envoyée. Nous vous recontactons sous 2 heures.');
                form.reset();
                return;
            }

            showStatus(statusEl, 'loading', 'Envoi en cours...');
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
                        showStatus(statusEl, 'success', '✅ Merci ! Votre demande a bien été envoyée. Nous vous recontactons sous 2 heures avec votre devis gratuit.');
                        form.reset();
                    } else {
                        return response.json().then(function (data) {
                            throw new Error(data.error || 'Erreur lors de l\'envoi');
                        });
                    }
                })
                .catch(function (error) {
                    showStatus(statusEl, 'error', '❌ Une erreur est survenue : ' + error.message + '. Veuillez nous appeler directement.');
                })
                .finally(function () {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                });
        });
    }

    function showStatus(element, type, message) {
        element.className = 'form-status ' + type;
        element.textContent = message;
    }

    // Scroll animations
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.service-card, .why-card, .testimonial, .process-step');
        if (!animatedElements.length) return;

        // Vérifier si l'utilisateur préfère réduire les animations
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        animatedElements.forEach(function (el) {
            if (prefersReducedMotion) {
                el.style.opacity = '1';
                el.style.transform = 'none';
                return;
            }

            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        if (prefersReducedMotion) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    // Initialisation
    document.addEventListener('DOMContentLoaded', function () {
        initFAQ();
        initHeaderScroll();
        initMobileMenu();
        initSmoothScroll();
        initContactForm();
        initScrollAnimations();
    });
})();
