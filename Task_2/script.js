document.addEventListener('DOMContentLoaded', () => {

    // --- FEATURE 1: CUSTOM MOUSE FOLLOWER ---
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorOutline = document.querySelector(".cursor-outline");
    const interactiveElements = document.querySelectorAll('a, button, .offering-card');

    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorOutline.style.borderColor = '#ff6347';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.borderColor = '#64ffda';
        });
    });

    // --- FEATURE 2: SCROLLING NAVBAR & PARALLAX HERO ---
    const header = document.getElementById('main-header');
    const heroBg = document.querySelector('.hero-bg');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        if (heroBg) {
            const scrollValue = window.scrollY;
            heroBg.style.transform = `translateY(${scrollValue * 0.3}px)`;
        }
    });

    // --- FEATURE 3: DYNAMIC TYPING EFFECT ---
    const typingElement = document.getElementById('typing-effect');
    if (typingElement) {
        const words = ["Learn.", "Intern.", "Grow."];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const type = () => {
            const currentWord = words[wordIndex];
            let displayText;
            if (isDeleting) {
                displayText = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                displayText = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }
            typingElement.textContent = displayText;
            let typeSpeed = isDeleting ? 100 : 200;
            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }
            setTimeout(type, typeSpeed);
        };
        type();
    }

    // --- FEATURE 4: SCROLL-TRIGGERED FADE-IN ANIMATIONS ---
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        revealElements.forEach(el => revealObserver.observe(el));
    }

    // --- FEATURE 5: DYNAMIC COUNTERS ---
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('.counter');
                    counters.forEach(counter => {
                        counter.innerText = '0';
                        const updateCount = () => {
                            const target = +counter.getAttribute('data-target');
                            const count = +counter.innerText.replace(/,/g, '').replace('+', '');
                            const increment = target / 200;
                            if (count < target) {
                                counter.innerText = Math.ceil(count + increment);
                                setTimeout(updateCount, 1);
                            } else {
                                counter.innerText = target.toLocaleString() + (target === 1000 ? '+' : '');
                            }
                        };
                        updateCount();
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counterObserver.observe(statsSection);
    }

    // --- FEATURE 6: AUTO-SLIDING TESTIMONIAL SLIDER ---
    const testimonialContainer = document.querySelector('#testimonials');
    if (testimonialContainer) {
        const testimonials = [
            { text: "The hands-on projects at Owl AI were a game-changer for my resume. I learned more here in 2 months than in 2 years of college.", author: "- Priya S., Data Analytics Intern" },
            { text: "A fantastic platform for freshers. The guided tasks gave me the confidence to apply for full-time roles.", author: "- Rohan M., Python Developer Intern" },
            { text: "I loved the flexibility of the self-paced internship. I could learn and work on my own schedule, which was perfect.", author: "- Anjali K., UI/UX Design Intern" }
        ];
        let currentTestimonialIndex = 0;
        let testimonialInterval;
        const slidesContainer = document.getElementById('testimonial-slides-container');

        testimonials.forEach((testimonial, index) => {
            const slide = document.createElement('div');
            slide.classList.add('testimonial-slide');
            if (index === 0) slide.classList.add('active');
            slide.innerHTML = `<p id="testimonial-text">${testimonial.text}</p><p id="testimonial-author">${testimonial.author}</p>`;
            slidesContainer.appendChild(slide);
        });

        const slides = document.querySelectorAll('.testimonial-slide');
        const showTestimonial = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                }
            });
        };

        const nextTestimonial = () => {
            currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
            showTestimonial(currentTestimonialIndex);
        };
        
        const prevTestimonial = () => {
            currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
            showTestimonial(currentTestimonialIndex);
        };

        const startSlider = () => {
            testimonialInterval = setInterval(nextTestimonial, 5000);
        };
        
        const resetSlider = () => {
            clearInterval(testimonialInterval);
            startSlider();
        };

        document.getElementById('next-testimonial').addEventListener('click', () => {
            nextTestimonial();
            resetSlider();
        });
        document.getElementById('prev-testimonial').addEventListener('click', () => {
            prevTestimonial();
            resetSlider();
        });
        
        startSlider();
    }

    // --- FEATURE 7: INTERACTIVE ENROLLMENT FORM ---
    const registrationContainer = document.getElementById('registration-container');
    const form = document.getElementById('enrollment-form');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const nameInput = document.getElementById('name');
            const userName = nameInput.value.trim();
            if (userName === "") {
                alert("Please enter your name.");
                return;
            }
            registrationContainer.innerHTML = `
                <div class="form-confirmation">
                    <h3>Thank You, ${userName}!</h3>
                    <p>Your registration is complete. We've sent a confirmation email with the next steps.</p>
                </div>
            `;
        });
    }

    // --- FEATURE 8: CUSTOM DROPDOWN LOGIC ---
    function initializeCustomSelects() {
        const wrappers = document.getElementsByClassName("custom-select-wrapper");
        for (let i = 0; i < wrappers.length; i++) {
            const selectEl = wrappers[i].getElementsByTagName("select")[0];
            const selectedDiv = document.createElement("DIV");
            selectedDiv.setAttribute("class", "select-selected");
            selectedDiv.innerHTML = selectEl.options[selectEl.selectedIndex].innerHTML;
            wrappers[i].appendChild(selectedDiv);

            const optionsDiv = document.createElement("DIV");
            optionsDiv.setAttribute("class", "select-items select-hide");

            for (let j = 0; j < selectEl.length; j++) {
                const option = document.createElement("DIV");
                option.innerHTML = selectEl.options[j].innerHTML;
                if (j === 0) {
                     option.style.display = 'none';
                }
                option.addEventListener("click", function(e) {
                    for (let k = 0; k < selectEl.length; k++) {
                        if (selectEl.options[k].innerHTML == this.innerHTML) {
                            selectEl.selectedIndex = k;
                            selectedDiv.innerHTML = this.innerHTML;
                            const sameAsSelected = this.parentNode.getElementsByClassName("same-as-selected");
                            for (let l = 0; l < sameAsSelected.length; l++) {
                                sameAsSelected[l].removeAttribute("class");
                            }
                            this.setAttribute("class", "same-as-selected");
                            break;
                        }
                    }
                    selectedDiv.click();
                });
                optionsDiv.appendChild(option);
            }
            wrappers[i].appendChild(optionsDiv);

            selectedDiv.addEventListener("click", function(e) {
                e.stopPropagation();
                closeAllSelect(this);
                this.nextSibling.classList.toggle("select-hide");
                this.classList.toggle("select-arrow-active");
            });
        }

        function closeAllSelect(elmnt) {
            const items = document.getElementsByClassName("select-items");
            const selected = document.getElementsByClassName("select-selected");
            for (let i = 0; i < selected.length; i++) {
                if (elmnt != selected[i]) {
                    selected[i].classList.remove("select-arrow-active");
                }
            }
            for (let i = 0; i < items.length; i++) {
                if (elmnt != selected[i]) {
                    items[i].classList.add("select-hide");
                }
            }
        }
        document.addEventListener("click", closeAllSelect);
    }
    initializeCustomSelects();
});

// --- FEATURE 9: MAGNETIC HOVER EFFECT ---
const magneticElements = document.querySelectorAll('.magnetic');

magneticElements.forEach(el => {
    el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
        el.style.transition = 'transform 0.2s ease';
    });

    el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0) scale(1)';
        el.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
    });

    el.addEventListener('mouseenter', () => {
        el.style.boxShadow = '0 20px 40px rgba(100,255,218,0.3)';
    });

    el.addEventListener('mouseleave', () => {
        el.style.boxShadow = 'none';
    });
});
