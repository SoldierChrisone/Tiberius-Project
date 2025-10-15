// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.init();
    }

    init() {
        // Initialize theme
        this.loadTheme();
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getSavedTheme()) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.applyTheme();
            }
        });
    }

    loadTheme() {
        // Check if user has a saved preference, otherwise use system preference
        const savedTheme = this.getSavedTheme();
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        this.applyTheme();
    }

    getSavedTheme() {
        // Use a simple variable since localStorage is not available in sandboxed environment
        return window.userThemePreference || null;
    }

    saveTheme() {
        // Save to a window variable instead of localStorage
        window.userThemePreference = this.currentTheme;
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
        
        // Add visual feedback
        this.themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.themeToggle.style.transform = 'scale(1)';
        }, 150);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-color-scheme', this.currentTheme);
        this.themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        
        // Update theme toggle tooltip
        this.themeToggle.setAttribute('aria-label', 
            this.currentTheme === 'light' ? 'Váltás sötét témára' : 'Váltás világos témára'
        );
    }
}

// Mobile Navigation
class MobileNavigation {
    constructor() {
        this.menuToggle = document.getElementById('menuToggle');
        this.navLinks = document.getElementById('navLinks');
        this.isOpen = false;
        this.init();
    }

    init() {
        this.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });
        
        // Close menu when clicking on links
        this.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.nav')) {
                this.closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.openMenu();
        } else {
            this.closeMenu();
        }
    }

    openMenu() {
        this.navLinks.classList.add('active');
        this.menuToggle.textContent = '✕';
        this.menuToggle.setAttribute('aria-label', 'Menü bezárása');
        this.isOpen = true;
    }

    closeMenu() {
        this.navLinks.classList.remove('active');
        this.menuToggle.textContent = '☰';
        this.menuToggle.setAttribute('aria-label', 'Menü megnyitása');
        this.isOpen = false;
    }
}

// Smooth Scrolling
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Handle homepage logo clicks - prevent navigation
                if (href === '#') {
                    e.preventDefault();
                    // Smooth scroll to top instead of navigating away
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    return false;
                }
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Contact Form
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.messageContainer = document.getElementById('formMessage');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        this.form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldError(field));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Ez a mező kötelező';
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Kérjük, adjon meg egy érvényes email címet';
            }
        }

        this.setFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    setFieldValidation(field, isValid, errorMessage) {
        const existingError = field.parentNode.querySelector('.field-error');
        
        if (existingError) {
            existingError.remove();
        }

        if (!isValid) {
            const errorEl = document.createElement('div');
            errorEl.className = 'field-error';
            errorEl.textContent = errorMessage;
            errorEl.style.color = 'var(--color-error)';
            errorEl.style.fontSize = 'var(--font-size-sm)';
            errorEl.style.marginTop = 'var(--space-4)';
            field.parentNode.appendChild(errorEl);
        }
    }

    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const fields = this.form.querySelectorAll('input, textarea');
        let isFormValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showMessage('Kérjük, javítsa ki a hibákat és próbálja újra!', 'error');
            return;
        }

        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
            service: 'DebreTech Contact Form'
        };

        // Show loading state
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Küldés...';
        this.showMessage('Üzenet küldése...', 'info');
        
        // Simulate form submission (in real app, this would be an API call)
        try {
            await this.simulateSubmission(data);
            this.showMessage('Üzenetét sikeresen elküldtük! Hamarosan felvesszük Önnel a kapcsolatot.', 'success');
            this.form.reset();
            
            // Clear all field errors
            fields.forEach(field => this.clearFieldError(field));
            
        } catch (error) {
            this.showMessage('Hiba történt az üzenet küldése során. Kérjük, próbálja újra később.', 'error');
        } finally {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Üzenet Küldése';
        }
    }

    simulateSubmission(data) {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() < 0.95) {
                    console.log('Form submission data:', data);
                    resolve(data);
                } else {
                    reject(new Error('Network error'));
                }
            }, 1500);
        });
    }

    showMessage(message, type) {
        this.messageContainer.innerHTML = `
            <div class="status status--${type}" style="margin-top: 16px;">
                ${message}
            </div>
        `;

        if (type === 'success') {
            setTimeout(() => {
                this.messageContainer.innerHTML = '';
            }, 6000);
        }
    }
}

// Chatbot
class Chatbot {
    constructor() {
        this.toggle = document.getElementById('chatbotToggle');
        this.window = document.getElementById('chatbotWindow');
        this.messages = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendButton = document.getElementById('chatbotSend');
        this.isOpen = false;
        this.conversationHistory = [];
        
        this.responses = {
            greeting: [
                "Üdvözlöm! DebreTech AI asszisztens vagyok. Miben segíthetek ma?",
                "Szia! Mit szeretne tudni AI és IT megoldásainkról?",
                "Szuper, hogy itt van! Mire kíváncsi DebreTech szolgáltatásaival kapcsolatban?"
            ],
            pricing: `🤖 **AI és IT szolgáltatásaink árai:**\n• AI Chatbot & Automatizálás: 25.000 Ft/hó\n• IT Rendszerintegráció & Support: 15.000 Ft/hó\n• Online jelenlét & Review management: 10.000 Ft/hó\n• Időpontfoglalási rendszerek: 8.000 Ft/hó\n💡 Kombinált csomagok 20% kedvezménnyel!`,
            services: "🛠️ Fő szolgáltatásaink: AI chatbotok és automatizálás, IT rendszerintegráció, online jelenlét menedzsment, és időpontfoglalási rendszerek. Melyik érdekelné?",
            contact: "📞 Elérhetőségek: +36 30 123 4567, info@debretech.hu. Debrecenben vagyunk, de országosan dolgozunk!",
            ai: "🤖 AI megoldásainkkal automatizálhatja ügyfélszolgálatát, lead gyűjtését, és üzleti folyamatait. Make.com platformot használunk a workflow automatizáláshoz.",
            it: "💻 IT szolgáltatásaink: Windows telepítés, PC karbantartás, rendszerintegráció, hálózat kiépítés és folyamatos IT támogatás vállalkozások számára.",
            online: "⭐ Online jelenlét szolgáltatásaink: Google & Facebook review management, SEO optimalizálás, és digitális marketing megoldások.",
            appointment: "📅 Időpontfoglalási rendszerek: Calendly/SimplyBook integráció, webhook automatizálás, CRM kapcsolatok és értesítések.",
            debrecen: "🏢 Debrecenben székelünk, de az egész országban dolgozunk. Helyi szakértelem, országos lefedettség!",
            help: "💬 Segítek minden kérdésben! Beszélhetünk árakról, szolgáltatásokról, vagy technikai részletekről. Mit szeretne tudni?",
            default: "🤔 Érdekes kérdés! Beszéljünk róla részletesebben. Hívjon fel a +36 30 123 4567 számon, vagy írjon az info@debretech.hu címre!"
        };
        
        this.init();
    }

    init() {
        this.toggle.addEventListener('click', () => this.toggleWindow());
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Close chatbot when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.chatbot') && this.isOpen) {
                this.closeWindow();
            }
        });

        // Prevent chatbot from closing when clicking inside
        this.window.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    toggleWindow() {
        if (this.isOpen) {
            this.closeWindow();
        } else {
            this.openWindow();
        }
    }

    openWindow() {
        this.window.classList.add('active');
        this.isOpen = true;
        this.input.focus();
        
        // Add opening animation
        this.window.style.transform = 'scale(0.8)';
        this.window.style.opacity = '0';
        setTimeout(() => {
            this.window.style.transform = 'scale(1)';
            this.window.style.opacity = '1';
        }, 10);
    }

    closeWindow() {
        this.window.classList.remove('active');
        this.isOpen = false;
    }

    sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.conversationHistory.push({ type: 'user', message, timestamp: new Date() });
        this.input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate thinking time
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
            this.conversationHistory.push({ type: 'bot', message: response, timestamp: new Date() });
        }, 800 + Math.random() * 1000);
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message message--bot typing-indicator';
        indicator.innerHTML = '💭 Gépelés...';
        indicator.style.fontStyle = 'italic';
        indicator.style.opacity = '0.7';
        this.messages.appendChild(indicator);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = this.messages.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    addMessage(message, sender) {
        const messageEl = document.createElement('div');
        messageEl.className = `message message--${sender}`;
        
        // Format message with line breaks
        const formattedMessage = message.replace(/\\n/g, '\n').replace(/\n/g, '<br>');
        messageEl.innerHTML = formattedMessage;
        
        this.messages.appendChild(messageEl);
        this.messages.scrollTop = this.messages.scrollHeight;

        // Add animation
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateY(10px)';
        setTimeout(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        }, 10);
    }

    generateResponse(message) {
        const msg = message.toLowerCase().trim();
        
        // Contextual responses based on conversation history
        const recentMessages = this.conversationHistory.slice(-3).map(h => h.message.toLowerCase());
        
        if (msg.includes('ár') || msg.includes('költség') || msg.includes('mennyibe') || msg.includes('díj')) {
            return this.responses.pricing;
        }
        
        if (msg.includes('szolgáltatás') || msg.includes('mit csinál') || msg.includes('mit kínál')) {
            return this.responses.services;
        }
        
        if (msg.includes('kapcsolat') || msg.includes('telefon') || msg.includes('email') || msg.includes('elérhetőség')) {
            return this.responses.contact;
        }
        
        if (msg.includes('ai') || msg.includes('chatbot') || msg.includes('automatizál') || msg.includes('mesterséges')) {
            return this.responses.ai;
        }
        
        if (msg.includes('it') || msg.includes('számítógép') || msg.includes('rendszer') || msg.includes('windows')) {
            return this.responses.it;
        }

        if (msg.includes('online') || msg.includes('review') || msg.includes('google') || msg.includes('facebook')) {
            return this.responses.online;
        }

        if (msg.includes('időpont') || msg.includes('calendly') || msg.includes('foglalás') || msg.includes('meeting')) {
            return this.responses.appointment;
        }

        if (msg.includes('debrecen') || msg.includes('hol') || msg.includes('cím') || msg.includes('helyszín')) {
            return this.responses.debrecen;
        }
        
        if (msg.includes('szia') || msg.includes('hello') || msg.includes('üdv') || msg.includes('jó') && msg.includes('nap')) {
            return this.responses.greeting[Math.floor(Math.random() * this.responses.greeting.length)];
        }

        if (msg.includes('segít') || msg.includes('help') || msg.includes('hogy') || msg.includes('mit')) {
            return this.responses.help;
        }
        
        return this.responses.default;
    }
}

// Scroll to Top functionality
class ScrollToTop {
    constructor() {
        this.button = null;
        this.init();
    }

    init() {
        this.createButton();
        window.addEventListener('scroll', () => this.handleScroll());
    }

    createButton() {
        this.button = document.createElement('button');
        this.button.innerHTML = '↑';
        this.button.className = 'scroll-to-top';
        this.button.setAttribute('aria-label', 'Vissza a tetejére');
        this.button.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--color-primary);
            color: var(--color-btn-primary-text);
            border: none;
            font-size: 20px;
            cursor: pointer;
            box-shadow: var(--shadow-lg);
            transition: all 0.3s ease;
            z-index: 999;
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
        `;

        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        document.body.appendChild(this.button);
    }

    handleScroll() {
        if (window.pageYOffset > 300) {
            this.button.style.opacity = '1';
            this.button.style.transform = 'translateY(0)';
            this.button.style.pointerEvents = 'auto';
        } else {
            this.button.style.opacity = '0';
            this.button.style.transform = 'translateY(20px)';
            this.button.style.pointerEvents = 'none';
        }
    }
}

// Animation Observer for scroll-triggered animations
class AnimationObserver {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe service and feature cards
        const cards = document.querySelectorAll('.service-card, .feature-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(card);
        });
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('DebreTech Website Performance:', {
                    loadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                    domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                    totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart)
                });
            }
        });
    }
}

// Main Application Controller
class DebreTechApp {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize all components
            this.components.themeManager = new ThemeManager();
            this.components.mobileNavigation = new MobileNavigation();
            this.components.smoothScroll = new SmoothScroll();
            this.components.contactForm = new ContactForm();
            this.components.chatbot = new Chatbot();
            this.components.scrollToTop = new ScrollToTop();
            this.components.animationObserver = new AnimationObserver();
            this.components.performanceMonitor = new PerformanceMonitor();

            // Add loading animation
            this.addLoadingAnimation();

            console.log('DebreTech website initialized successfully!');
        } catch (error) {
            console.error('Error initializing DebreTech website:', error);
        }
    }

    addLoadingAnimation() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    }
}

// Initialize the application
const app = new DebreTechApp();