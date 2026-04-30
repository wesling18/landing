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
  initChatbot();
  initDataGoto();
  initCursorGlow();

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

// --- Chatbot Interactivo ---
function initChatbot() {
  const fab = document.getElementById('chat-fab');
  const win = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const msgContainer = document.getElementById('chat-messages');
  const quickReplies = document.getElementById('chat-quick-replies');
  const emailForm = document.getElementById('chat-email-form');
  const emailInput = document.getElementById('chat-email-input');
  if (!fab || !win) return;

  let chatOpen = false;
  let chatStarted = false;

  // Show FAB only after passing Hero (section > 0)
  // We piggyback on the existing goTo function by watching currentSection
  const checkFabVisibility = () => {
    if (currentSection > 0) {
      fab.classList.add('visible');
    }
  };
  // Override goTo to also check FAB visibility
  const originalGoTo = window.goTo;
  window.goTo = function(index) {
    originalGoTo(index);
    setTimeout(checkFabVisibility, 100);
  };
  window.goToSection = window.goTo;

  // Toggle chat
  fab.addEventListener('click', () => {
    chatOpen = !chatOpen;
    win.classList.toggle('open', chatOpen);
    if (chatOpen && !chatStarted) {
      chatStarted = true;
      startConversation();
    }
    // Re-render Lucide icons for new elements
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  });

  closeBtn.addEventListener('click', () => {
    chatOpen = false;
    win.classList.remove('open');
  });

  // -- Message Helpers --
  function addMessage(text, isBot = true) {
    const div = document.createElement('div');
    div.className = `chat-msg flex ${isBot ? 'justify-start' : 'justify-end'}`;
    const bubble = document.createElement('div');
    bubble.className = isBot
      ? 'max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white text-espresso text-xs leading-relaxed shadow-sm border border-espresso/5'
      : 'max-w-[85%] px-4 py-3 rounded-2xl rounded-br-sm bg-terracotta text-white text-xs leading-relaxed shadow-sm';
    bubble.innerHTML = text;
    div.appendChild(bubble);
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg flex justify-start';
    div.id = 'typing-indicator';
    div.innerHTML = '<div class="px-4 py-3 rounded-2xl rounded-bl-sm bg-white shadow-sm border border-espresso/5 flex items-center gap-1.5"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function botReply(text, delay = 1200) {
    showTyping();
    return new Promise(resolve => {
      setTimeout(() => {
        hideTyping();
        addMessage(text, true);
        resolve();
      }, delay);
    });
  }

  function setQuickReplies(options) {
    quickReplies.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'px-3 py-1.5 text-[10px] font-medium tracking-wide uppercase rounded-full border border-espresso/15 text-espresso/70 bg-white hover:bg-terracotta hover:text-white hover:border-terracotta transition-all';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        addMessage(opt.label, false);
        quickReplies.innerHTML = '';
        opt.action();
      });
      quickReplies.appendChild(btn);
    });
  }

  // -- Conversation Flow --
  function startConversation() {
    botReply('\u00a1Hola! \ud83d\udc4b Soy el asistente de <strong>TapMeal</strong>.').then(() => {
      return botReply('\u00bfListo para eliminar las filas en tu cafeter\u00eda y convertir cada visita en una venta?', 1000);
    }).then(() => {
      setQuickReplies([
        { label: '\u00bfEs seguro?', action: answerSecurity },
        { label: '\u00bfQu\u00e9 tan r\u00e1pido es?', action: answerSpeed },
        { label: '\u00bfQui\u00e9n lo desarrolla?', action: answerTeam },
        { label: 'Quiero probarlo', action: answerBeta }
      ]);
    });
  }

  function showMainMenu() {
    setQuickReplies([
      { label: '\u00bfEs seguro?', action: answerSecurity },
      { label: '\u00bfQu\u00e9 tan r\u00e1pido es?', action: answerSpeed },
      { label: '\u00bfQui\u00e9n lo desarrolla?', action: answerTeam },
      { label: 'Quiero probarlo', action: answerBeta }
    ]);
  }

  function answerSecurity() {
    botReply('Usamos <strong>Supabase</strong> (basado en PostgreSQL), con encriptaci\u00f3n de datos en tr\u00e1nsito y en reposo. Tu informaci\u00f3n y la de tus clientes est\u00e1 protegida con est\u00e1ndares bancarios. \ud83d\udd12').then(() => {
      return botReply('Adem\u00e1s, ning\u00fan dato sensible se almacena en el dispositivo del cliente.', 800);
    }).then(() => {
      setQuickReplies([
        { label: 'Otra pregunta', action: showMainMenu },
        { label: 'Quiero probarlo', action: answerBeta }
      ]);
    });
  }

  function answerSpeed() {
    botReply('TapMeal es una <strong>PWA</strong>: funciona directo desde el navegador. Tus clientes escanean un QR, ven el men\u00fa y ordenan en <strong>menos de 30 segundos</strong>. \u26a1').then(() => {
      return botReply('Cero descargas, cero esperas. El pedido llega a cocina en tiempo real.', 800);
    }).then(() => {
      setQuickReplies([
        { label: 'Otra pregunta', action: showMainMenu },
        { label: 'Quiero probarlo', action: answerBeta }
      ]);
    });
  }

  function answerTeam() {
    botReply('Somos estudiantes de la <strong>UNAN CUR Chontales</strong>, liderados por:\n<br>\u2022 <strong>Edgar Mart\u00ednez</strong> \u2014 Scrum Master\n<br>\u2022 <strong>Gustavo Dom\u00ednguez</strong> \u2014 Dev Team\n<br>\u2022 <strong>Wesling Murillo</strong> \u2014 Dev Team\n<br>\u2022 <strong>Mar\u00eda Garc\u00eda</strong> \u2014 Product Owner').then(() => {
      return botReply('Un equipo apasionado por modernizar la atenci\u00f3n en cafeter\u00edas de Juigalpa. \u2615', 800);
    }).then(() => {
      setQuickReplies([
        { label: 'Otra pregunta', action: showMainMenu },
        { label: 'Quiero probarlo', action: answerBeta }
      ]);
    });
  }

  function answerBeta() {
    botReply('\u00a1Genial! \ud83d\ude80 Solo quedan <strong>3 plazas</strong> para la Beta privada en Juigalpa.').then(() => {
      return botReply('Deja tu correo y te enviaremos acceso exclusivo antes que nadie:', 800);
    }).then(() => {
      quickReplies.innerHTML = '';
      emailForm.classList.remove('hidden');
      emailInput.focus();
    });
  }

  // Email form submission
  emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;
    addMessage(email, false);
    emailForm.classList.add('hidden');
    emailInput.value = '';
    botReply('\u00a1Registrado! \u2705 Te contactaremos pronto en <strong>' + email + '</strong>.').then(() => {
      return botReply('Mientras tanto, explora la demo interactiva del men\u00fa arriba. \u00a1Gracias por tu inter\u00e9s en TapMeal! \u2615', 800);
    }).then(() => {
      setQuickReplies([
        { label: 'Ver Demo', action: () => { chatOpen = false; win.classList.remove('open'); window.goTo(2); } },
        { label: 'Otra pregunta', action: showMainMenu }
      ]);
    });
  });
}
