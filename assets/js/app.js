/**
 * Tanveer Ahmed - Professional Portfolio Engine
 * Features:
 * - Dynamic data binding from PortfolioStore (supports live updates)
 * - Scroll-triggered animations & stagger reveals
 * - Reading scroll progress bar
 * - Interactive Milestone / Image Showcase Carousel
 * - Animated Metric Counters
 * - Interactive Skills Category Filter
 * - 3D Mouse Parallax Tilt for Profile Card
 * - Recruiter-friendly Quick Contact & Print Mode
 * - Owner Admin Authentication & Live Edit trigger
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize portfolio immediately from cached or default data
  renderPortfolio();

  // Then asynchronously sync from the latest public portfolio data.
  if (PortfolioStore.syncFromSource) {
    PortfolioStore.syncFromSource().then(() => {
      renderPortfolio();
    }).catch(error => {
      console.error("Could not load the latest portfolio data.", error);
      showToast("The latest portfolio update could not be loaded. Please try again later.");
    });
  }

  // Setup scroll listeners & observers
  setupScrollProgress();
  setupScrollSpy();
  setupScrollReveals();
  setupCounterAnimations();
  setupProfileTilt();
  setupShowcaseCarousel();
  setupAdminModal();
  checkAdminSession();
  setupMobileMenu();

  // Listen for data updates from admin
  window.addEventListener("portfolioDataUpdated", (e) => {
    renderPortfolio();
    setupCounterAnimations();
    showToast("Portfolio data refreshed successfully!");
  });
});

/**
 * Render all content dynamically from PortfolioStore
 */
function renderPortfolio() {
  const data = PortfolioStore.getData();

  // 1. Personal & Brand Info
  document.querySelectorAll(".dyn-name").forEach(el => el.textContent = data.personal.name);
  document.querySelectorAll(".dyn-title").forEach(el => el.textContent = data.personal.title);
  
  const subTitleEl = document.getElementById("dyn-sub-title");
  if (subTitleEl) subTitleEl.textContent = data.personal.subTitle;

  const bioEl = document.getElementById("dyn-bio");
  if (bioEl) bioEl.textContent = data.personal.bio;

  const objEl = document.getElementById("dyn-objective");
  if (objEl) objEl.textContent = data.personal.careerObjective;

  const locationEl = document.getElementById("dyn-location");
  if (locationEl) locationEl.textContent = data.personal.location;

  const emailEls = document.querySelectorAll(".dyn-email");
  emailEls.forEach(el => {
    el.textContent = data.personal.email;
    if (el.tagName === "A") el.href = `mailto:${data.personal.email}`;
  });

  const phoneEls = document.querySelectorAll(".dyn-phone");
  const primaryPhone = data.personal.phones && data.personal.phones[0] ? data.personal.phones[0] : "01726105293";
  phoneEls.forEach(el => {
    el.textContent = data.personal.phones ? data.personal.phones.join(" / ") : primaryPhone;
    if (el.tagName === "A") el.href = `tel:${primaryPhone.replace(/\D/g, '')}`;
  });

  // Profile Photo
  const photoImg = document.getElementById("dyn-profile-img");
  if (photoImg && data.personal.photo) {
    photoImg.src = data.personal.photo;
    photoImg.alt = data.personal.name;
  }

  // WhatsApp Link
  const whatsappBtns = document.querySelectorAll(".dyn-whatsapp-btn");
  const waNumber = data.personal.whatsapp || "8801726105293";
  whatsappBtns.forEach(btn => {
    btn.href = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hello Tanveer, I reviewed your professional profile regarding an opportunity.")}`;
  });

  // 2. Metrics Render
  const metricsContainer = document.getElementById("metrics-container");
  if (metricsContainer && data.metrics) {
    metricsContainer.innerHTML = data.metrics.map((m, idx) => `
      <div class="stat-item reveal-item delay-${(idx + 1) * 100}">
        <div class="stat-number-wrap">
          <span class="stat-number" data-target="${m.value}">${m.value}</span>
          ${m.outOf ? `<span class="stat-suffix">/ ${m.outOf}</span>` : ''}
        </div>
        <div class="stat-label">${m.label}</div>
        <div class="stat-badge">${m.badge}</div>
      </div>
    `).join("");
  }

  // 3. Work Experience Render
  const expContainer = document.getElementById("experience-container");
  if (expContainer && data.experiences) {
    expContainer.innerHTML = data.experiences.map((exp, idx) => `
      <div class="experience-card reveal-item delay-100">
        <div class="exp-header">
          <div>
            <h3 class="exp-role">${exp.role}</h3>
            <div class="exp-company">
              <i class="fas fa-building"></i> ${exp.company}
              <span style="color: var(--slate-400); font-size: 0.85rem;">• ${exp.location}</span>
            </div>
          </div>
          <div class="exp-badge-group">
            <span class="badge-type"><i class="fas fa-briefcase"></i> ${exp.type}</span>
            <span class="badge-period"><i class="far fa-calendar-alt"></i> ${exp.period}</span>
          </div>
        </div>
        <p class="exp-summary">${exp.summary}</p>
        <ul class="exp-points-list">
          ${(exp.responsibilities || []).map(pt => `
            <li class="exp-point">
              <i class="fas fa-check-circle"></i>
              <span>${pt}</span>
            </li>
          `).join("")}
        </ul>
      </div>
    `).join("");
  }

  // 4. Education Render
  const eduContainer = document.getElementById("education-container");
  if (eduContainer && data.education) {
    eduContainer.innerHTML = data.education.map((edu, idx) => `
      <div class="education-card ${edu.isHighlighted ? 'featured' : ''} reveal-item delay-${(idx % 2 + 1) * 100}">
        <div>
          <div class="edu-top">
            <div>
              <h3 class="edu-degree">${edu.degree}</h3>
              <div class="edu-institution">${edu.institution}</div>
            </div>
            <span class="edu-period">${edu.period}</span>
          </div>
          <div class="edu-grade-box">
            <span class="edu-grade-label">${edu.department || 'Grade'}</span>
            <span class="edu-grade-value ${edu.isHighlighted ? 'highlight' : ''}">${edu.result}</span>
          </div>
          <p class="edu-details">${edu.details || ''}</p>
        </div>
      </div>
    `).join("");
  }

  // 5. Training Render
  const trainContainer = document.getElementById("training-container");
  if (trainContainer && data.training) {
    trainContainer.innerHTML = data.training.map((tr, idx) => `
      <div class="training-card reveal-item delay-${(idx + 1) * 100}">
        <div class="training-card-header">
          <div class="training-icon-box">
            <i class="fas ${tr.title.toLowerCase().includes('computer') ? 'fa-laptop-code' : 'fa-industry'}"></i>
          </div>
          <div>
            <h3 class="training-title">${tr.title}</h3>
            <div class="training-meta">${tr.institution}</div>
            <span class="training-badge">${tr.duration}</span>
          </div>
        </div>
        <div class="training-modules-grid">
          ${(tr.modules || []).map(mod => `
            <div class="training-module-item">
              <i class="fas fa-angle-right"></i>
              <span>${mod}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  // 6. Skills Render
  renderSkills("all");

  // 7. Showcase Cards Render (Carousel / Interactive Grid)
  const showcaseTrack = document.getElementById("showcase-track");
  if (showcaseTrack && data.showcaseCards) {
    showcaseTrack.innerHTML = data.showcaseCards.map((sc, idx) => `
      <div class="showcase-slide reveal-item delay-${(idx + 1) * 100}">
        <div>
          <span class="showcase-tag">${sc.tag}</span>
          <h4 class="showcase-title">${sc.title}</h4>
          <div class="showcase-subtitle">${sc.subtitle}</div>
        </div>
        <p class="showcase-desc">${sc.description}</p>
      </div>
    `).join("");
  }

  // 8. References Render
  const refContainer = document.getElementById("references-container");
  if (refContainer && data.references) {
    refContainer.innerHTML = data.references.map((ref, idx) => {
      const initials = ref.name.split(" ").filter(w => w.length > 0).map(w => w[0]).slice(0, 2).join("");
      return `
        <div class="reference-card reveal-item delay-${(idx + 1) * 100}">
          <div>
            <div class="ref-header">
              <div class="ref-avatar">${initials}</div>
              <div>
                <h3 class="ref-name">${ref.name}</h3>
                <div class="ref-designation">${ref.title}</div>
                <div class="ref-company">${ref.company}</div>
              </div>
            </div>
            <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 1.25rem;">
              <i class="fas fa-tag" style="color: var(--blue-600); font-size: 0.8rem;"></i> ${ref.relation}
            </p>
          </div>
          <div class="ref-contacts">
            <div class="ref-contact-row">
              <i class="fas fa-envelope"></i>
              <a href="mailto:${ref.email}">${ref.email}</a>
            </div>
            <div class="ref-contact-row">
              <i class="fas fa-phone-alt"></i>
              <a href="tel:${ref.phone.replace(/\D/g, '')}">${ref.phone}</a>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Setup Skill filter buttons
  setupSkillFilter();
}

/**
 * Filter skills by category
 */
function renderSkills(category) {
  const data = PortfolioStore.getData();
  const container = document.getElementById("skills-container");
  if (!container || !data.skills) return;

  const filtered = category === "all" 
    ? data.skills 
    : data.skills.filter(s => s.category === category);

  container.innerHTML = filtered.map(skill => `
    <div class="skill-card reveal-item">
      <div class="skill-info">
        <span class="skill-name">${skill.name}</span>
        <span class="skill-category-tag">${formatCategory(skill.category)}</span>
      </div>
      <div class="skill-progress-bg">
        <div class="skill-progress-bar" style="width: ${skill.level}%;"></div>
      </div>
    </div>
  `).join("");
}

function formatCategory(cat) {
  switch (cat) {
    case "merchandising": return "Apparel & Merchandising";
    case "supply_chain": return "Supply Chain & ERP";
    case "tech": return "IT & Software";
    case "soft": return "Leadership";
    default: return "Core Competency";
  }
}

function setupSkillFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-category");
      renderSkills(category);
    });
  });
}

/**
 * Scroll Progress Bar
 */
function setupScrollProgress() {
  const progressBar = document.getElementById("scroll-progress");
  const backToTopBtn = document.getElementById("back-to-top-btn");

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (backToTopBtn) {
      if (scrollTop > 400) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

/**
 * Scroll Spy for Navbar
 */
function setupScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });

    // Header shadow on scroll
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      if (scrollY > 30) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
  });
}

/**
 * Stagger Scroll Reveals (Guaranteed Visible)
 */
function setupScrollReveals() {
  document.querySelectorAll(".reveal-item").forEach(el => {
    el.classList.add("revealed");
  });
}

/**
 * Smooth Animated Counter for Numbers
 */
function setupCounterAnimations() {
  const statNumbers = document.querySelectorAll(".stat-number");
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetStr = el.getAttribute("data-target") || el.textContent;
        const isDecimal = targetStr.includes(".");
        const targetVal = parseFloat(targetStr);

        if (!isNaN(targetVal)) {
          let current = 0;
          const duration = 1200;
          const steps = 40;
          const stepVal = targetVal / steps;
          const stepTime = duration / steps;

          const timer = setInterval(() => {
            current += stepVal;
            if (current >= targetVal) {
              current = targetVal;
              clearInterval(timer);
            }
            el.textContent = isDecimal ? current.toFixed(2) : Math.floor(current);
          }, stepTime);
        }

        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach(el => observer.observe(el));
}

/**
 * 3D Parallax Tilt for Executive Profile Card
 */
function setupProfileTilt() {
  const card = document.getElementById("hero-profile-card");
  if (!card) return;

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
  });
}

/**
 * Interactive Showcase Carousel (Auto glide + manual click)
 */
function setupShowcaseCarousel() {
  const track = document.getElementById("showcase-track");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");

  if (!track || !prevBtn || !nextBtn) return;

  const scrollAmount = 340;

  prevBtn.addEventListener("click", () => {
    track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    track.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  // Subtle auto-scroll pause on hover
  let autoScroll = setInterval(() => {
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }, 4500);

  track.addEventListener("mouseenter", () => clearInterval(autoScroll));
  track.addEventListener("mouseleave", () => {
    autoScroll = setInterval(() => {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 4500);
  });
}

/**
 * Owner Admin Authentication Modal
 */
function setupAdminModal() {
  const modal = document.getElementById("admin-login-modal");
  const openBtns = document.querySelectorAll(".btn-open-admin-modal");
  const closeBtn = document.getElementById("admin-modal-close");
  const form = document.getElementById("admin-login-form");

  if (!modal) return;

  openBtns.forEach(b => {
    b.addEventListener("click", (e) => {
      e.preventDefault();
      // If already logged in, redirect straight to admin.html
      if (sessionStorage.getItem("tanveer_admin_logged_in") === "true") {
        window.location.href = "admin.html";
        return;
      }
      modal.classList.add("active");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  }

  // Keyboard shortcut Ctrl+Shift+A for Tanveer to quickly open login
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
      e.preventDefault();
      modal.classList.toggle("active");
    }
  });

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("admin-email-input").value;
      const pass = document.getElementById("admin-pass-input").value;

      try {
        if (await PortfolioStore.verifyAuth(email, pass)) {
          sessionStorage.setItem("tanveer_admin_logged_in", "true");
          modal.classList.remove("active");
          showToast("Welcome Tanveer Ahmed! Redirecting to CMS Dashboard...");
          setTimeout(() => {
            window.location.href = "admin.html";
          }, 800);
        } else {
          alert("Invalid email or password.");
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }
}

/**
 * Check if Admin session is active
 */
async function checkAdminSession() {
  const banner = document.getElementById("owner-admin-banner");
  try {
    const response = await fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) throw new Error("Admin session is not active.");
    if (banner) banner.classList.add("active");
  } catch (error) {
    sessionStorage.removeItem("tanveer_admin_logged_in");
    if (banner) banner.classList.remove("active");
  }

  const logoutBtn = document.getElementById("admin-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await PortfolioStore.logout();
      } catch (error) {
        alert(error.message);
        return;
      }
      sessionStorage.removeItem("tanveer_admin_logged_in");
      window.location.reload();
    });
  }
}

/**
 * Mobile Navigation Drawer
 */
function setupMobileMenu() {
  const toggleBtn = document.getElementById("mobile-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener("click", () => {
    navLinks.classList.toggle("mobile-open");
    const isOpen = navLinks.classList.contains("mobile-open");
    toggleBtn.innerHTML = isOpen ? `<i class="fas fa-times"></i>` : `<i class="fas fa-bars"></i>`;
  });

  // Close when clicking any nav link
  navLinks.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("mobile-open");
      toggleBtn.innerHTML = `<i class="fas fa-bars"></i>`;
    });
  });
}

/**
 * Toast Notification Utility
 */
function showToast(message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast-msg";
  toast.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981;"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}
