class ModernSlider {
    constructor(container) {
        this.container = container;
        this.track = container.querySelector('#sliderTrack');
        this.slides = [...container.querySelectorAll('.slide')];
        this.prevBtn = container.querySelector('#prevBtn');
        this.nextBtn = container.querySelector('#nextBtn');
        this.paginationDots = [...container.querySelectorAll('.pagination-dot')];
        this.progressFill = container.querySelector('#progressFill');

        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.isTransitioning = false;

        // Touch gesture properties
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;

        // Auto-play properties
        this.autoPlayInterval = null;
        this.autoPlayDelay = 8000; // 8 seconds
        this.isAutoPlaying = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTouchGestures();
        this.setupKeyboardNavigation();
        this.setupIntersectionObserver();
        this.updateSlider();
        this.startAutoPlay();

        // Add ARIA attributes
        this.setupAccessibility();

        console.log('Modern Slider initialized with', this.totalSlides, 'slides');
    }

    setupEventListeners() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.goToPrevious());
        this.nextBtn.addEventListener('click', () => this.goToNext());

        // Pagination dots
        this.paginationDots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Pause auto-play on hover
        this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());

        // Pause auto-play on focus (for accessibility)
        this.container.addEventListener('focusin', () => this.pauseAutoPlay());
        this.container.addEventListener('focusout', () => this.resumeAutoPlay());

        // Handle visibility change (pause when tab is not active)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else {
                this.resumeAutoPlay();
            }
        });

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateSlider();
            }, 250);
        });
    }

    setupTouchGestures() {
        // Touch events for mobile swiping
        this.track.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.pauseAutoPlay();
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            // Prevent default scrolling if horizontal swipe is detected
            const deltaX = Math.abs(e.touches[0].clientX - this.touchStartX);
            const deltaY = Math.abs(e.touches[0].clientY - this.touchStartY);

            if (deltaX > deltaY) {
                e.preventDefault();
            }
        }, { passive: false });

        this.track.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe();

            // Resume auto-play after a delay
            setTimeout(() => this.resumeAutoPlay(), 3000);
        }, { passive: true });

        // Mouse drag support for desktop
        let isMouseDown = false;
        let startX = 0;

        this.track.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            startX = e.clientX;
            this.track.style.cursor = 'grabbing';
            e.preventDefault();
            this.pauseAutoPlay();
        });

        this.track.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            e.preventDefault();
        });

        this.track.addEventListener('mouseup', (e) => {
            if (!isMouseDown) return;
            isMouseDown = false;
            this.track.style.cursor = 'grab';

            const deltaX = e.clientX - startX;
            if (Math.abs(deltaX) > this.minSwipeDistance) {
                if (deltaX > 0) {
                    this.goToPrevious();
                } else {
                    this.goToNext();
                }
            }

            setTimeout(() => this.resumeAutoPlay(), 3000);
        });

        this.track.addEventListener('mouseleave', () => {
            if (isMouseDown) {
                isMouseDown = false;
                this.track.style.cursor = 'grab';
                this.resumeAutoPlay();
            }
        });
    }

    setupKeyboardNavigation() {
        // Make slider focusable
        this.container.setAttribute('tabindex', '0');

        this.container.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.goToPrevious();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.goToNext();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides - 1);
                    break;
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.isAutoPlaying ? this.pauseAutoPlay() : this.resumeAutoPlay();
                    break;
            }
        });
    }

    setupIntersectionObserver() {
        // Pause auto-play when slider is not visible
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.resumeAutoPlay();
                    } else {
                        this.pauseAutoPlay();
                    }
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(this.container);
    }

    setupAccessibility() {
        // Add ARIA attributes
        this.container.setAttribute('role', 'region');
        this.container.setAttribute('aria-label', 'Servicios de podología');

        this.track.setAttribute('role', 'group');
        this.track.setAttribute('aria-live', 'polite');

        this.slides.forEach((slide, index) => {
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-label', `Servicio ${index + 1} de ${this.totalSlides}`);
        });

        // Update button states
        this.updateButtonStates();
    }

    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;

        // Check if it's a horizontal swipe (not vertical scroll)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.minSwipeDistance) {
            if (deltaX > 0) {
                this.goToPrevious();
            } else {
                this.goToNext();
            }
        }
    }

    goToSlide(index, direction = 'auto') {
        if (this.isTransitioning || index === this.currentIndex) return;

        this.isTransitioning = true;

        // Determine direction if not specified
        if (direction === 'auto') {
            direction = index > this.currentIndex ? 'next' : 'prev';
        }

        const previousIndex = this.currentIndex;
        this.currentIndex = index;

        // Update transform
        const translateX = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${translateX}%)`;

        // Update pagination and progress
        this.updatePagination();
        this.updateProgress();
        this.updateButtonStates();

        // Add animation classes
        this.addAnimationClasses(direction);

        // Announce change to screen readers
        this.announceSlideChange();

        // Reset transition flag
        setTimeout(() => {
            this.isTransitioning = false;
            this.removeAnimationClasses();
        }, 600);
    }

    goToNext() {
        const nextIndex = (this.currentIndex + 1) % this.totalSlides;
        this.goToSlide(nextIndex, 'next');
    }

    goToPrevious() {
        const prevIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevIndex, 'prev');
    }

    updateSlider() {
        // Ensure current slide is visible
        const translateX = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${translateX}%)`;
        this.updatePagination();
        this.updateProgress();
        this.updateButtonStates();
    }

    updatePagination() {
        this.paginationDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
            dot.setAttribute('aria-pressed', index === this.currentIndex ? 'true' : 'false');
        });
    }

    updateProgress() {
        const progress = ((this.currentIndex + 1) / this.totalSlides) * 100;
        this.progressFill.style.width = `${progress}%`;
    }

    updateButtonStates() {
        // For infinite loop, buttons are always enabled
        // If you want finite loop, uncomment below:
        // this.prevBtn.disabled = this.currentIndex === 0;
        // this.nextBtn.disabled = this.currentIndex === this.totalSlides - 1;

        this.prevBtn.setAttribute('aria-label', `Ir al servicio anterior (${this.currentIndex === 0 ? this.totalSlides : this.currentIndex})`);
        this.nextBtn.setAttribute('aria-label', `Ir al siguiente servicio (${this.currentIndex === this.totalSlides - 1 ? 1 : this.currentIndex + 2})`);
    }

    addAnimationClasses(direction) {
        const currentSlide = this.slides[this.currentIndex];
        const textContent = currentSlide.querySelector('.text-content');
        const imageContent = currentSlide.querySelector('.slide-image');

        if (direction === 'next') {
            textContent.classList.add('slide-in-left');
            imageContent.classList.add('slide-in-right');
        } else {
            textContent.classList.add('slide-in-right');
            imageContent.classList.add('slide-in-left');
        }
    }

    removeAnimationClasses() {
        this.slides.forEach(slide => {
            const textContent = slide.querySelector('.text-content');
            const imageContent = slide.querySelector('.slide-image');

            textContent.classList.remove('slide-in-left', 'slide-in-right');
            imageContent.classList.remove('slide-in-left', 'slide-in-right');
        });
    }

    announceSlideChange() {
        const currentSlide = this.slides[this.currentIndex];
        const title = currentSlide.querySelector('.slide-title').textContent;

        // Create a temporary element for screen reader announcement
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        announcement.textContent = `Mostrando ${title}. Slide ${this.currentIndex + 1} de ${this.totalSlides}`;

        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
    }

    startAutoPlay() {
        if (this.isAutoPlaying) return;

        this.isAutoPlaying = true;
        this.autoPlayInterval = setInterval(() => {
            if (!this.isTransitioning) {
                this.goToNext();
            }
        }, this.autoPlayDelay);
    }

    pauseAutoPlay() {
        if (!this.isAutoPlaying) return;

        this.isAutoPlaying = false;
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resumeAutoPlay() {
        if (this.isAutoPlaying || document.hidden) return;

        this.startAutoPlay();
    }

    // Public API methods
    destroy() {
        this.pauseAutoPlay();
        // Remove event listeners and clean up
        this.container.removeAttribute('tabindex');
        this.track.style.transform = '';
        console.log('Modern Slider destroyed');
    }

    getCurrentSlide() {
        return this.currentIndex;
    }

    getTotalSlides() {
        return this.totalSlides;
    }
}

/**
 * Mobile Navigation Handler (from the new philosophy)
 */
class MobileNavigation {
    constructor() {
        this.navContainer = document.querySelector('.nav-container');
        this.mobileToggle = document.querySelector('.mobile-toggle');
        this.navMenu = document.querySelector('.navMenu');
        this.navLinks = document.querySelectorAll('.navList a, .cta a');

        this.isOpen = false;

        this.init();
    }

    init() {
        if (!this.mobileToggle || !this.navMenu) return;

        this.setupEventListeners();
        this.setupAccessibility();
    }

    setupEventListeners() {
        this.mobileToggle.addEventListener('click', () => this.toggleMenu());

        // Close menu when clicking nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.navContainer.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    setupAccessibility() {
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        this.mobileToggle.setAttribute('aria-controls', 'navigation-menu');
        this.navMenu.setAttribute('id', 'navigation-menu');
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.isOpen = true;
        this.navMenu.classList.add('active');
        this.mobileToggle.classList.add('active');
        this.mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');

        // Focus first nav link
        const firstLink = this.navMenu.querySelector('a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 300);
        }
    }

    closeMenu() {
        this.isOpen = false;
        this.navMenu.classList.remove('active');
        this.mobileToggle.classList.remove('active');
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    }
}

/**
 * Initialize everything when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile navigation
    const mobileNav = new MobileNavigation();

    // Initialize slider
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        const slider = new ModernSlider(sliderContainer);

        // Expose slider to global scope for debugging
        window.podologySlider = slider;
    }

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Performance optimization: Lazy load images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    console.log('Podology page initialized successfully!');
});