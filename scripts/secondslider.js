class SecondarySlider {
    constructor(sliderElement) {
        this.slider = sliderElement;
        this.slidesContainer = this.slider.querySelector('.secondarySlides');
        this.slides = this.slider.querySelectorAll('.secondarySlide');
        this.indicators = this.slider.querySelectorAll('.secondaryIndicator');
        this.prevButton = this.slider.querySelector('.secondaryNavArrow--left');
        this.nextButton = this.slider.querySelector('.secondaryNavArrow--right');

        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.isTransitioning = false;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 seconds

        // Touch handling properties
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 50;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        this.startAutoPlay();
        this.updateSlider();
        this.handleImageLoading();
    }

    setupEventListeners() {
        // Navigation arrows
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.nextSlide());
        }

        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Pause autoplay on hover/focus
        this.slider.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.slider.addEventListener('mouseleave', () => this.startAutoPlay());
        this.slider.addEventListener('focusin', () => this.pauseAutoPlay());
        this.slider.addEventListener('focusout', () => this.startAutoPlay());

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });
    }

    setupKeyboardNavigation() {
        this.slider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextSlide();
            } else if (e.key >= '1' && e.key <= '5') {
                e.preventDefault();
                const slideIndex = parseInt(e.key) - 1;
                if (slideIndex < this.totalSlides) {
                    this.goToSlide(slideIndex);
                }
            } else if (e.key === 'Home') {
                e.preventDefault();
                this.goToSlide(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                this.goToSlide(this.totalSlides - 1);
            }
        });

        // Make slider focusable
        this.slider.setAttribute('tabindex', '0');
        this.slider.setAttribute('role', 'region');
        this.slider.setAttribute('aria-label', 'Galería de equipos médicos');
    }

    setupTouchNavigation() {
        // Touch events for mobile swipe
        this.slider.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.slider.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        // Prevent default touch behavior to avoid interference
        this.slider.addEventListener('touchmove', (e) => {
            if (Math.abs(this.touchStartX - e.changedTouches[0].screenX) > 10) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    handleSwipe() {
        const swipeDistance = this.touchStartX - this.touchEndX;

        if (Math.abs(swipeDistance) < this.minSwipeDistance) {
            return; // Not a significant swipe
        }

        if (swipeDistance > 0) {
            // Swiped left, go to next slide
            this.nextSlide();
        } else {
            // Swiped right, go to previous slide
            this.prevSlide();
        }
    }

    nextSlide() {
        if (this.isTransitioning) return;

        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        if (this.isTransitioning) return;

        const prevIndex = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentSlide || index < 0 || index >= this.totalSlides) {
            return;
        }

        this.isTransitioning = true;
        const prevSlide = this.currentSlide;
        this.currentSlide = index;

        // Add transition classes for animation
        this.slides[prevSlide].classList.add('leaving');
        this.slides[this.currentSlide].classList.add('entering');

        this.updateSlider();

        // Clean up transition classes and reset flag
        setTimeout(() => {
            this.slides[prevSlide].classList.remove('leaving');
            this.slides[this.currentSlide].classList.remove('entering');
            this.isTransitioning = false;
        }, 600); // Match CSS transition duration
    }

    updateSlider() {
        // Update slides container position
        this.slidesContainer.className = `secondarySlides slide-${this.currentSlide}`;

        // Update active slide
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
            indicator.setAttribute('aria-pressed', index === this.currentSlide ? 'true' : 'false');
        });

        // Update ARIA live region for screen readers
        this.announceSlideChange();
    }

    announceSlideChange() {
        // Create or update live region for accessibility
        let liveRegion = document.getElementById('secondary-slider-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'secondary-slider-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }

        const currentImg = this.slides[this.currentSlide].querySelector('img');
        if (currentImg) {
            const altText = currentImg.getAttribute('alt') || `Imagen ${this.currentSlide + 1}`;
            liveRegion.textContent = `Slide ${this.currentSlide + 1} de ${this.totalSlides}: ${altText}`;
        } else {
            liveRegion.textContent = `Slide ${this.currentSlide + 1} de ${this.totalSlides}`;
        }
    }

    handleImageLoading() {
        this.slider.classList.add('loading');

        const images = this.slider.querySelectorAll('img');
        let loadedImages = 0;

        if (images.length === 0) {
            this.slider.classList.remove('loading');
            return;
        }

        const checkAllLoaded = () => {
            loadedImages++;
            if (loadedImages === images.length) {
                this.slider.classList.remove('loading');
            }
        };

        images.forEach(img => {
            if (img.complete && img.naturalWidth > 0) {
                checkAllLoaded();
            } else {
                img.addEventListener('load', checkAllLoaded);
                img.addEventListener('error', checkAllLoaded);
            }
        });
    }

    startAutoPlay() {
        this.pauseAutoPlay(); // Clear any existing interval

        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    // Public methods for external control
    setAutoPlayDelay(delay) {
        this.autoPlayDelay = Math.max(1000, delay); // Minimum 1 second
        if (this.autoPlayInterval) {
            this.startAutoPlay(); // Restart with new delay
        }
    }

    toggleAutoPlay() {
        if (this.autoPlayInterval) {
            this.pauseAutoPlay();
            return false; // Autoplay now disabled
        } else {
            this.startAutoPlay();
            return true; // Autoplay now enabled
        }
    }

    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.totalSlides;
    }

    // Cleanup method
    destroy() {
        this.pauseAutoPlay();

        // Remove event listeners
        if (this.prevButton) {
            this.prevButton.removeEventListener('click', () => this.prevSlide());
        }
        if (this.nextButton) {
            this.nextButton.removeEventListener('click', () => this.nextSlide());
        }

        // Remove live region
        const liveRegion = document.getElementById('secondary-slider-live-region');
        if (liveRegion) {
            liveRegion.remove();
        }

        // Remove transition classes
        this.slides.forEach(slide => {
            slide.classList.remove('active', 'entering', 'leaving');
        });
    }
}

// Intersection Observer for performance optimization
class SecondarySliderObserver {
    constructor() {
        this.sliders = [];
        this.observer = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const slider = this.sliders.find(s => s.element === entry.target);
                    if (slider) {
                        if (entry.isIntersecting) {
                            slider.instance.startAutoPlay();
                        } else {
                            slider.instance.pauseAutoPlay();
                        }
                    }
                });
            }, {
                threshold: 0.3 // Start/stop when 30% of slider is visible
            });
        }
    }

    observe(sliderElement, sliderInstance) {
        if (this.observer) {
            this.sliders.push({ element: sliderElement, instance: sliderInstance });
            this.observer.observe(sliderElement);
        }
    }

    unobserve(sliderElement) {
        if (this.observer) {
            this.observer.unobserve(sliderElement);
            this.sliders = this.sliders.filter(s => s.element !== sliderElement);
        }
    }
}

// Auto-initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const sliderElements = document.querySelectorAll('.secondarySlider');
    const observer = new SecondarySliderObserver();

    sliderElements.forEach((sliderElement, index) => {
        const slider = new SecondarySlider(sliderElement);
        observer.observe(sliderElement, slider);

        // Make slider instance available globally for debugging/external control
        sliderElement.sliderInstance = slider;

        // Add unique ID if not present
        if (!sliderElement.id) {
            sliderElement.id = `secondary-slider-${index + 1}`;
        }

        // Log initialization
        console.log(`Secondary Slider ${index + 1} initialized with ${slider.getTotalSlides()} slides`);
    });

    // Global utility functions
    window.SecondarySliderUtils = {
        // Get slider instance by element or ID
        getInstance: (elementOrId) => {
            let element;
            if (typeof elementOrId === 'string') {
                element = document.getElementById(elementOrId);
            } else {
                element = elementOrId;
            }
            return element ? element.sliderInstance : null;
        },

        // Control all sliders
        pauseAll: () => {
            document.querySelectorAll('.secondarySlider').forEach(el => {
                if (el.sliderInstance) {
                    el.sliderInstance.pauseAutoPlay();
                }
            });
        },

        startAll: () => {
            document.querySelectorAll('.secondarySlider').forEach(el => {
                if (el.sliderInstance) {
                    el.sliderInstance.startAutoPlay();
                }
            });
        },

        // Go to specific slide in all sliders
        goToSlideAll: (slideIndex) => {
            document.querySelectorAll('.secondarySlider').forEach(el => {
                if (el.sliderInstance) {
                    el.sliderInstance.goToSlide(slideIndex);
                }
            });
        }
    };
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecondarySlider, SecondarySliderObserver };
}

// Add to window for global access
window.SecondarySlider = SecondarySlider;
window.SecondarySliderObserver = SecondarySliderObserver; 