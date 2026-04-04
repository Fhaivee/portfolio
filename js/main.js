/* =============================================
   MAIN JS — Navigation, Scroll, Mobile Menu
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll effect ---
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  function handleNavScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active section highlighting
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', handleNavScroll);
  handleNavScroll();

  // --- Mobile menu ---
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinksContainer = document.querySelector('.nav-links');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinksContainer.classList.toggle('open');
    });

    // Close menu on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinksContainer.classList.remove('open');
      });
    });
  }

  // --- Scroll reveal ---
  const revealElements = document.querySelectorAll('.reveal, .stagger-reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Typing effect for hero subtitle ---
  const typingEl = document.querySelector('.typing-text');
  if (typingEl) {
    const texts = [
      'Systems Engineer',
      'Home Lab Enthusiast',
      'Cybersecurity Student',
      'Self-Hosting Advocate'
    ];
    let textIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let delay = 100;

    function typeLoop() {
      const current = texts[textIdx];

      if (!isDeleting) {
        typingEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        delay = 80;
        if (charIdx === current.length) {
          isDeleting = true;
          delay = 2000;
        }
      } else {
        typingEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        delay = 40;
        if (charIdx === 0) {
          isDeleting = false;
          textIdx = (textIdx + 1) % texts.length;
          delay = 300;
        }
      }

      setTimeout(typeLoop, delay);
    }

    setTimeout(typeLoop, 1000);
  }

  // --- Contact form (simple client-side feedback) ---
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-primary');
      const originalText = btn.textContent;
      btn.textContent = 'Message Sent! ✓';
      btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

  // --- Counter animation for stats ---
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        let count = 0;
        const duration = 1500;
        const step = target / (duration / 16);

        const counter = setInterval(() => {
          count += step;
          if (count >= target) {
            count = target;
            clearInterval(counter);
          }
          el.textContent = prefix + Math.floor(count) + suffix;
        }, 16);

        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));
});
