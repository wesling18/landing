// ==========================================
// TapMeal — Full-Page Block Navigation
// ==========================================

let currentSection = 0;
let isAnimating = false;
let sections = [];
let dots = [];
let sectionNames = [];
const TRANSITION_MS = 900;

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
  initBetaForm();
  initInteractiveMenu();
  initMobileMenu();
  initRevealAnimations();

  // Reveal first section immediately
  sections[0]?.classList.add("active");
});

// --- Navigation Core ---
window.goTo = goTo;
window.goToSection = goTo;
function goTo(index) {
  if (isAnimating || index === currentSection || index < 0 || index >= sections.length) return;
  isAnimating = true;

  // Remove active from old
  sections[currentSection].classList.remove("active");
  sections[currentSection].classList.add("leaving");

  currentSection = index;

  // Move wrapper
  const wrapper = document.getElementById("fp-wrapper");
  wrapper.style.transform = `translateY(-${currentSection * 100}vh)`;

  // Add active to new
  setTimeout(() => {
    sections.forEach(s => s.classList.remove("leaving"));
    sections[currentSection].classList.add("active");
  }, 300);

  setTimeout(() => { isAnimating = false; }, TRANSITION_MS);
  updateUI();
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
  let accumulated = 0;
  const THRESHOLD = 50;
  let timeout;

  window.addEventListener("wheel", (e) => {
    e.preventDefault();
    accumulated += e.deltaY;
    clearTimeout(timeout);
    timeout = setTimeout(() => { accumulated = 0; }, 200);

    if (Math.abs(accumulated) > THRESHOLD) {
      if (accumulated > 0) goNext(); else goPrev();
      accumulated = 0;
    }
  }, { passive: false });
}

// --- Keyboard Navigation ---
function initKeyboardNav() {
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); goNext(); }
    if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); goPrev(); }
    if (e.key === "Home") { e.preventDefault(); goTo(0); }
    if (e.key === "End") { e.preventDefault(); goTo(sections.length - 1); }
  });
}

// --- Touch/Swipe Navigation ---
function initTouchNav() {
  let startY = 0;
  window.addEventListener("touchstart", (e) => { startY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener("touchend", (e) => {
    const diff = startY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext(); else goPrev();
    }
  }, { passive: true });
}

// --- Dot Navigation ---
function initDotNav() {
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i));
  });
}

// --- Mobile Menu ---
function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    menu.classList.toggle("open");
    btn.classList.toggle("open");
  });

  menu.querySelectorAll("[data-goto]").forEach(link => {
    link.addEventListener("click", () => {
      const idx = parseInt(link.dataset.goto, 10);
      goTo(idx);
      menu.classList.remove("open");
      btn.classList.remove("open");
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
        dot.classList.toggle("bg-terracota", i === activeIdx);
        dot.classList.toggle("w-5", i === activeIdx);
        dot.classList.toggle("bg-carbon/15", i !== activeIdx);
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
      btn.classList.add("bg-terracota");
      btn.classList.remove("bg-carbon");
      if (window.lucide) window.lucide.createIcons();

      // Async total update
      demoTotal += price;
      demoItems += 1;
      updateDemoTotal();

      // Reset button after delay
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.classList.remove("bg-terracota");
        btn.classList.add("bg-carbon");
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
        orderBtn.classList.remove("bg-carbon", "hover:bg-terracota");
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => {
          demoTotal = 0;
          demoItems = 0;
          updateDemoTotal();
          orderBtn.innerHTML = origText;
          orderBtn.classList.remove("bg-emerald-600");
          orderBtn.classList.add("bg-carbon", "hover:bg-terracota");
          orderBtn.disabled = true;
          if (window.lucide) window.lucide.createIcons();
        }, 2000);
      }, 1500);
    });
  }

  function updateDemoTotal() {
    if (totalEl) {
      totalEl.textContent = "$" + demoTotal.toFixed(2);
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
  const items = document.querySelectorAll(".reveal-item");
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger based on sibling index for sequential reveal
        const parent = entry.target.parentElement;
        const siblings = parent ? Array.from(parent.querySelectorAll(".reveal-item")) : [entry.target];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add("revealed"), idx * 150);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => observer.observe(item));
}
