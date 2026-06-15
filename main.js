// ==========================================
// TapMeal — Full-Page Block Navigation
// ==========================================

let currentSection = 0;
let isAnimating = false;
let sections = [];
let dots = [];
let sectionNames = [];
const TRANSITION_MS = 900;

// Detect dvh support for wrapper transform
const supportsDvh = CSS.supports && CSS.supports('height', '100dvh');
const vh = supportsDvh ? 'dvh' : 'vh';

// Initialize everything on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();
  sections = Array.from(document.querySelectorAll(".fp-section"));
  dots = Array.from(document.querySelectorAll(".fp-dot"));
  sectionNames = sections.map(s => s.dataset.label || "");

  // Set initial state
  updateUI();
  initWheelNav();
  initKeyboardNav();
  initTouchNav();
  initDotNav();
  initSectionObserver();
  initBetaForm();
  initInteractiveMenu();
  initMobileMenu();
  initRevealAnimations();
  initFAQ();
  initDataGoto();
  initCursorGlow();
  initLaunchRegistration();

  // Reveal first section immediately
  if (sections[0]) {
    sections[0].classList.add("active");
    setTimeout(triggerReveal, 500);
  }
});

function initCursorGlow() {
  const root = document.documentElement;
  window.addEventListener('mousemove', (e) => {
    root.style.setProperty('--mouse-x', `${e.clientX}px`);
    root.style.setProperty('--mouse-y', `${e.clientY}px`);
  });
}

function initDataGoto() {
  document.querySelectorAll("[data-goto]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = parseInt(link.dataset.goto, 10);
      goTo(idx);
    });
  });
}

// --- Navigation Core ---
window.goTo = goTo;
window.goToSection = goTo;
function goTo(index) {
  if (index < 0 || index >= sections.length) return;
  sections[index].scrollIntoView({ behavior: 'smooth' });
  setTimeout(triggerReveal, 100);
}

function triggerReveal() {
  const activeSection = sections[currentSection];
  if (!activeSection) return;
  
  const reveals = activeSection.querySelectorAll("[data-reveal]");
  reveals.forEach((el, i) => {
    const delay = parseInt(el.style.getPropertyValue('--delay')) || 0;
    setTimeout(() => {
      el.classList.add("reveal-visible");
    }, delay + (i * 50));
  });
}

function goNext() { goTo(currentSection + 1); }
function goPrev() { goTo(currentSection - 1); }

function updateUI() {
  // Update dots
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSection);
  });
  // Update label
  const label = document.getElementById("fp-label");
  if (label) label.textContent = sectionNames[currentSection] || "";
  // Update counter
  const counter = document.getElementById("fp-counter");
  if (counter) counter.textContent = `${String(currentSection + 1).padStart(2, "0")} / ${String(sections.length).padStart(2, "0")}`;
  // Header style
  const header = document.getElementById("site-header");
  if (header) {
    header.classList.toggle("scrolled", currentSection > 0);
  }
}

// --- Wheel Navigation ---
function initWheelNav() {
  // Let native scroll handle this
}

// --- Keyboard Navigation ---
function initKeyboardNav() {
  // Let native browser keyboard nav handle this
}

// --- Touch/Swipe Navigation ---
function initTouchNav() {
  // Let native swipe scroll handle this
}

// --- Dot Navigation ---
function initDotNav() {
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i));
  });
}

// --- Intersection Observer for Sections ---
function initSectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = sections.indexOf(entry.target);
        if (index !== -1 && currentSection !== index) {
          currentSection = index;
          sections.forEach(s => s.classList.remove("active"));
          entry.target.classList.add("active");
          triggerReveal();
          updateUI();
        }
      }
    });
  }, { threshold: 0.15 });
  
  sections.forEach(s => observer.observe(s));
}

// --- Mobile Menu ---
function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !menu.classList.contains('open');
    menu.classList.toggle('open', isOpen);
    btn.classList.toggle('open', isOpen);
    // Lock/unlock body scroll
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  btn.addEventListener("click", () => toggleMenu());

  menu.querySelectorAll("[data-goto]").forEach(link => {
    link.addEventListener("click", () => {
      const idx = parseInt(link.dataset.goto, 10);
      goTo(idx);
      toggleMenu(false);
    });
  });
}

// --- Beta Form ---
function initBetaForm() {
  const form = document.getElementById("beta-form");
  const msg = document.getElementById("form-message");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    const orig = btn.innerHTML;
    btn.innerHTML = '<span class="animate-pulse">Enviando...</span>';
    btn.disabled = true;
    msg.classList.add("hidden");

    await new Promise(r => setTimeout(r, 1500));

    msg.textContent = "¡Excelente! Te hemos añadido a la lista prioritaria.";
    msg.classList.remove("hidden", "text-red-400");
    msg.classList.add("text-emerald-400");
    form.reset();
    btn.innerHTML = orig;
    btn.disabled = false;
  });
}

// --- Interactive Demo (Smartphone Mockup) ---
function initInteractiveMenu() {
  // Demo Tabs Logic
  const demoTabs = document.querySelectorAll("[data-demo-tab]");
  const demoPanels = document.querySelectorAll("[data-demo-panel]");

  demoTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.target;
      
      // Update tabs
      demoTabs.forEach(t => {
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });

      // Update panels
      demoPanels.forEach(p => {
        if (p.dataset.demoPanel === target) {
          p.removeAttribute("hidden");
        } else {
          p.setAttribute("hidden", "");
        }
      });
    });
  });

  let demoTotal = 0;
  let demoItems = 0;
  const totalEl = document.getElementById("demo-total");
  const countEl = document.getElementById("demo-item-count");
  const orderBtn = document.getElementById("demo-order-btn");
  const carousel = document.getElementById("menu-carousel");
  const carouselDots = document.getElementById("carousel-dots");

  // 1. Reveal cards via Intersection Observer
  const cards = document.querySelectorAll(".demo-card");
  if (cards.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("revealed"), i * 120);
          observer.unobserve(entry.target);
        }
      });
    }, { root: carousel, threshold: 0.3 });
    cards.forEach(c => observer.observe(c));
  }

  // 1b. Phone mockup reveal via Intersection Observer
  const phoneMockup = document.querySelector(".phone-mockup");
  if (phoneMockup) {
    const phoneObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("revealed"), 200);
          phoneObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    phoneObserver.observe(phoneMockup);
  }

  // 1c. Dynamic Social Proof counter
  const orderCountEl = document.getElementById("order-count");
  if (orderCountEl) {
    let count = 24;
    setInterval(() => {
      count += Math.floor(Math.random() * 3) + 1;
      orderCountEl.textContent = count;
      orderCountEl.style.transition = "transform 0.3s ease";
      orderCountEl.style.transform = "scale(1.15)";
      setTimeout(() => { orderCountEl.style.transform = "scale(1)"; }, 300);
    }, 8000 + Math.random() * 5000);
  }

  // 2. Carousel dot tracking
  if (carousel && carouselDots) {
    const dots = carouselDots.querySelectorAll("span");
    carousel.addEventListener("scroll", () => {
      const scrollLeft = carousel.scrollLeft;
      const cardWidth = 200 + 16; // w-[200px] + gap-4
      const activeIdx = Math.round(scrollLeft / cardWidth);
      dots.forEach((dot, i) => {
        dot.classList.toggle("bg-terracotta", i === activeIdx);
        dot.classList.toggle("w-5", i === activeIdx);
        dot.classList.toggle("bg-espresso/15", i !== activeIdx);
        dot.classList.toggle("w-2", i !== activeIdx);
      });
    }, { passive: true });
  }

  // 3. Add to cart buttons with async total update
  document.querySelectorAll(".demo-add-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const price = parseFloat(btn.dataset.price) || 0;

      // Visual feedback: icon swap to check
      const orig = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="check" class="h-3.5 w-3.5"></i>';
      btn.classList.add("bg-terracotta");
      btn.classList.remove("bg-espresso");
      if (window.lucide) window.lucide.createIcons();

      // Async total update
      demoTotal += price;
      demoItems += 1;
      updateDemoTotal();

      // Reset button after delay
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.classList.remove("bg-terracotta");
        btn.classList.add("bg-espresso");
        if (window.lucide) window.lucide.createIcons();
      }, 1200);
    });
  });

  // 4. Order button (simulated confirmation)
  if (orderBtn) {
    orderBtn.addEventListener("click", () => {
      if (demoItems === 0) return;
      const origText = orderBtn.innerHTML;
      orderBtn.innerHTML = '<span class="animate-pulse">Procesando...</span>';
      orderBtn.disabled = true;
      setTimeout(() => {
        orderBtn.innerHTML = '<i data-lucide="check" class="h-4 w-4"></i> ¡Orden Enviada!';
        orderBtn.classList.add("bg-emerald-600");
        orderBtn.classList.remove("bg-espresso", "hover:bg-terracotta");
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => {
          demoTotal = 0;
          demoItems = 0;
          updateDemoTotal();
          orderBtn.innerHTML = origText;
          orderBtn.classList.remove("bg-emerald-600");
          orderBtn.classList.add("bg-espresso", "hover:bg-terracotta");
          orderBtn.disabled = true;
          if (window.lucide) window.lucide.createIcons();
        }, 2000);
      }, 1500);
    });
  }

  function updateDemoTotal() {
    if (totalEl) {
      totalEl.textContent = "C$ " + demoTotal.toFixed(2);
      totalEl.classList.add("total-pulse");
      setTimeout(() => totalEl.classList.remove("total-pulse"), 300);
    }
    if (countEl) {
      countEl.textContent = demoItems + (demoItems === 1 ? " item" : " items");
    }
    if (orderBtn) {
      orderBtn.disabled = demoItems === 0;
    }
  }
}

// --- Reveal Animations (Intersection Observer) ---
function initRevealAnimations() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(item => observer.observe(item));
}

// --- FAQ Accordion Logic ---
function initFAQ() {
  const triggers = document.querySelectorAll('.faq-trigger');
  
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const contentId = trigger.getAttribute('aria-controls');
      const content = document.getElementById(contentId);
      
      // Close all other accordions (optional, but good UX)
      triggers.forEach(t => {
        if (t !== trigger) {
          t.setAttribute('aria-expanded', 'false');
          const cId = t.getAttribute('aria-controls');
          const c = document.getElementById(cId);
          if (c) c.setAttribute('hidden', '');
        }
      });
      
      // Toggle current
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        if (content) content.setAttribute('hidden', '');
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        if (content) content.removeAttribute('hidden');
      }
    });
  });
}

// --- Launch Pre-Registration ---
function initLaunchRegistration() {
  const form = document.getElementById("launch-register-form");
  const formContainer = document.getElementById("register-form-container");
  const successEl = document.getElementById("register-success");
  
  if (!form || !formContainer || !successEl) return;

  const inputName = document.getElementById("reg-name");
  const inputEmail = document.getElementById("reg-email");
  const inputRestaurant = document.getElementById("reg-restaurant");
  
  const savedName = document.getElementById("saved-name");
  const savedEmail = document.getElementById("saved-email");
  const savedRestaurant = document.getElementById("saved-restaurant");
  
  const editBtn = document.getElementById("btn-edit-register");

  const iconName = document.getElementById("valid-icon-name");
  const iconEmail = document.getElementById("valid-icon-email");
  const iconRestaurant = document.getElementById("valid-icon-restaurant");

  function toggleInputStatus(input, iconEl, isValid) {
    if (isValid) {
      input.classList.remove("border-white/10", "focus:border-indigo-500", "focus:ring-indigo-500");
      input.classList.add("border-emerald-500/50", "focus:border-emerald-500", "focus:ring-emerald-500");
      if (iconEl) {
        iconEl.classList.remove("opacity-0", "scale-75");
        iconEl.classList.add("opacity-100", "scale-100");
      }
    } else {
      input.classList.add("border-white/10", "focus:border-indigo-500", "focus:ring-indigo-500");
      input.classList.remove("border-emerald-500/50", "focus:border-emerald-500", "focus:ring-emerald-500");
      if (iconEl) {
        iconEl.classList.add("opacity-0", "scale-75");
        iconEl.classList.remove("opacity-100", "scale-100");
      }
    }
  }

  function checkAllInputs() {
    if (inputName && iconName) {
      const isValid = inputName.value.trim().length >= 3;
      toggleInputStatus(inputName, iconName, isValid);
    }
    if (inputEmail && iconEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(inputEmail.value.trim());
      toggleInputStatus(inputEmail, iconEmail, isValid);
    }
    if (inputRestaurant && iconRestaurant) {
      const isValid = inputRestaurant.value.trim().length >= 2;
      toggleInputStatus(inputRestaurant, iconRestaurant, isValid);
    }
  }

  // Real-time validation listeners
  if (inputName && iconName) {
    inputName.addEventListener("input", () => {
      const isValid = inputName.value.trim().length >= 3;
      toggleInputStatus(inputName, iconName, isValid);
    });
  }

  if (inputEmail && iconEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    inputEmail.addEventListener("input", () => {
      const isValid = emailRegex.test(inputEmail.value.trim());
      toggleInputStatus(inputEmail, iconEmail, isValid);
    });
  }

  if (inputRestaurant && iconRestaurant) {
    inputRestaurant.addEventListener("input", () => {
      const isValid = inputRestaurant.value.trim().length >= 2;
      toggleInputStatus(inputRestaurant, iconRestaurant, isValid);
    });
  }

  // Check if user has already registered
  const savedDataRaw = localStorage.getItem("tapmeal_launch_registration");
  if (savedDataRaw) {
    try {
      const data = JSON.parse(savedDataRaw);
      showRegisteredState(data);
    } catch (e) {
      localStorage.removeItem("tapmeal_launch_registration");
    }
  }

  function showRegisteredState(data) {
    savedName.textContent = data.name;
    savedEmail.textContent = data.email;
    savedRestaurant.textContent = data.restaurant;
    
    formContainer.classList.add("hidden");
    successEl.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  function showFormState() {
    successEl.classList.add("hidden");
    formContainer.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const data = {
      name: inputName.value.trim(),
      email: inputEmail.value.trim(),
      restaurant: inputRestaurant.value.trim()
    };
    
    // Save to localStorage
    localStorage.setItem("tapmeal_launch_registration", JSON.stringify(data));
    
    // Animate submit button text
    const btn = form.querySelector("button[type=submit]");
    const orig = btn.textContent;
    btn.innerHTML = '<span class="animate-pulse">Guardando...</span>';
    btn.disabled = true;
    
    setTimeout(() => {
      showRegisteredState(data);
      btn.textContent = orig;
      btn.disabled = false;
    }, 1000);
  });

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      const savedDataRaw = localStorage.getItem("tapmeal_launch_registration");
      if (savedDataRaw) {
        try {
          const data = JSON.parse(savedDataRaw);
          inputName.value = data.name;
          inputEmail.value = data.email;
          inputRestaurant.value = data.restaurant;
        } catch(e) {}
      }
      showFormState();
      checkAllInputs(); // Verify status when pre-filling fields
    });
  }
}
