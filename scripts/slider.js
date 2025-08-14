class ModernSlider {
    constructor() {
        this.sliderTrack = document.getElementById('sliderTrack');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.sliderContainer = document.querySelector('.slider-container');
        
        this.currentSlide = 0;
        this.totalSlides = 3;
        this.autoAdvanceDelay = 4000; // 4 seconds
        this.intervalId = null;
        this.isUserInteracting = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.startAutoAdvance();
        this.updateSlider();
    }
    
    bindEvents() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => {
            this.pauseAutoAdvance();
            this.prevSlide();
            this.resumeAutoAdvanceAfterDelay();
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.pauseAutoAdvance();
            this.nextSlide();
            this.resumeAutoAdvanceAfterDelay();
        });
        
        // Dots navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.pauseAutoAdvance();
                this.goToSlide(index);
                this.resumeAutoAdvanceAfterDelay();
            });
        });
        
        // Pause on hover
        this.sliderContainer.addEventListener('mouseenter', () => {
            this.pauseAutoAdvance();
        });
        
        this.sliderContainer.addEventListener('mouseleave', () => {
            if (!this.isUserInteracting) {
                this.startAutoAdvance();
            }
        });
        
        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            this.pauseAutoAdvance();
        }, { passive: true });
        
        this.sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches.screenX;
            this.handleSwipe(touchStartX, touchEndX);
            this.resumeAutoAdvanceAfterDelay();
        }, { passive: true });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.pauseAutoAdvance();
                this.prevSlide();
                this.resumeAutoAdvanceAfterDelay();
            } else if (e.key === 'ArrowRight') {
                this.pauseAutoAdvance();
                this.nextSlide();
                this.resumeAutoAdvanceAfterDelay();
            }
        });
        
        // Pause when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoAdvance();
            } else {
                this.startAutoAdvance();
            }
        });
    }
    
    handleSwipe(startX, endX) {
        const minSwipeDistance = 50;
        const swipeDistance = endX - startX;
        
        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                this.prevSlide();
            } else {
                this.nextSlide();
            }
        }
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlider();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
    }
    
    goToSlide(slideIndex) {
        this.currentSlide = slideIndex;
        this.updateSlider();
    }
    
    updateSlider() {
        // Move slider track
        const translateX = -this.currentSlide * (100 / this.totalSlides);
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;
        
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
        
        // Add slide-in animation to content
        const currentSlideContent = this.sliderTrack.children[this.currentSlide].querySelector('.slide-content');
        currentSlideContent.classList.remove('slide-in');
        setTimeout(() => {
            currentSlideContent.classList.add('slide-in');
        }, 10);
    }
    
    startAutoAdvance() {
        this.pauseAutoAdvance();
        this.intervalId = setInterval(() => {
            this.nextSlide();
        }, this.autoAdvanceDelay);
    }
    
    pauseAutoAdvance() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    resumeAutoAdvanceAfterDelay() {
        this.isUserInteracting = true;
        setTimeout(() => {
            this.isUserInteracting = false;
            this.startAutoAdvance();
        }, 2000); // Resume after 2 seconds of inactivity
    }
}

// Initialize slider when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ModernSlider();
});