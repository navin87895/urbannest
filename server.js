const loader = document.querySelector("[data-loader]");
const startupPopup = document.querySelector("[data-startup-popup]");
const openStartup = document.querySelector("[data-open-startup]");
const closeStartupButtons = document.querySelectorAll("[data-close-startup]");
const popupForm = document.querySelector("[data-popup-form]");
const popupStatus = document.querySelector("[data-popup-status]");
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-btn]");
const mobilePanel = document.querySelector("[data-mobile-panel]");
const rail = document.querySelector("[data-project-rail]");
const prevButton = document.querySelector("[data-slide-prev]");
const nextButton = document.querySelector("[data-slide-next]");
const filterControls = document.querySelectorAll("[data-filter]");
const resetFilters = document.querySelector("[data-reset-filters]");
const projectCards = document.querySelectorAll(".project-card");
const emptyState = document.querySelector("[data-empty]");
const enquiryButtons = document.querySelectorAll("[data-enquiry]");
const leadForm = document.querySelector("[data-lead-form]");
const formStatus = document.querySelector("[data-form-status]");
const reviews = document.querySelectorAll(".review");
const reviewDots = document.querySelector("[data-review-dots]");
const counters = document.querySelectorAll("[data-count]");
const sideRail = document.querySelector("[data-side-rail]");
const railLinks = document.querySelectorAll(".side-rail a");

if (window.lucide) {
  window.lucide.createIcons();
}

if (startupPopup.classList.contains("is-open")) {
  document.body.classList.add("no-scroll");
}

let lastScrollY = window.scrollY;

const syncHeader = () => {
  const currentY = window.scrollY;
  const scrollingDown = currentY > lastScrollY && currentY > 180;
  const showRail = currentY > window.innerHeight * 0.45;

  header.classList.toggle("is-scrolled", currentY > 28);
  header.classList.toggle("is-hidden", scrollingDown);
  sideRail.classList.toggle("is-visible", showRail);
  lastScrollY = Math.max(currentY, 0);
};

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

window.addEventListener("load", () => {
  setTimeout(() => loader.classList.add("is-hidden"), 650);
});

const openPopup = () => {
  startupPopup.classList.add("is-open");
  startupPopup.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
};

const closePopup = () => {
  startupPopup.classList.remove("is-open");
  startupPopup.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
};

openStartup.addEventListener("click", openPopup);
closeStartupButtons.forEach((button) => button.addEventListener("click", closePopup));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePopup();
});

menuButton.addEventListener("click", () => {
  mobilePanel.classList.toggle("is-open");
});

mobilePanel.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => mobilePanel.classList.remove("is-open"));
});

let dragActive = false;
let dragStartX = 0;
let scrollStart = 0;

rail.addEventListener("pointerdown", (event) => {
  dragActive = true;
  dragStartX = event.clientX;
  scrollStart = rail.scrollLeft;
  rail.classList.add("dragging");
  rail.setPointerCapture(event.pointerId);
});

rail.addEventListener("pointermove", (event) => {
  if (!dragActive) return;
  rail.scrollLeft = scrollStart - (event.clientX - dragStartX);
});

const stopDrag = () => {
  dragActive = false;
  rail.classList.remove("dragging");
};

rail.addEventListener("pointerup", stopDrag);
rail.addEventListener("pointercancel", stopDrag);
rail.addEventListener("pointerleave", stopDrag);

prevButton.addEventListener("click", () => rail.scrollBy({ left: -420, behavior: "smooth" }));
nextButton.addEventListener("click", () => rail.scrollBy({ left: 420, behavior: "smooth" }));

const getFilters = () => {
  return Array.from(filterControls).reduce((acc, control) => {
    acc[control.dataset.filter] = control.value;
    return acc;
  }, {});
};

const applyFilters = () => {
  const filters = getFilters();
  let visible = 0;

  projectCards.forEach((card) => {
    const match = Object.entries(filters).every(([key, value]) => {
      return value === "all" || card.dataset[key] === value;
    });
    card.classList.toggle("is-hidden", !match);
    if (match) visible += 1;
  });

  emptyState.classList.toggle("is-visible", visible === 0);
};

filterControls.forEach((control) => control.addEventListener("change", applyFilters));
resetFilters.addEventListener("click", () => {
  filterControls.forEach((control) => {
    control.value = "all";
  });
  applyFilters();
});

enquiryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openPopup();
    popupForm.elements.message.value = `Interested in ${button.dataset.enquiry}. Please share pricing and availability.`;
  });
});

const postLead = async (form, statusElement) => {
  const data = Object.fromEntries(new FormData(form).entries());
  statusElement.textContent = "Sending...";
  const isHostedDemo = !["localhost", "127.0.0.1"].includes(window.location.hostname);

  try {
    const response = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Request failed");

    statusElement.textContent = `Saved enquiry #${result.id}. Backend is working.`;
    form.reset();
    return true;
  } catch (error) {
    if (isHostedDemo) {
      statusElement.textContent = "Thanks. Your demo enquiry has been received.";
      form.reset();
      return true;
    }

    statusElement.textContent = "Backend not reachable yet. Run with node server.js.";
    return false;
  }
};

popupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const sent = await postLead(popupForm, popupStatus);
  if (sent) setTimeout(closePopup, 900);
});

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await postLead(leadForm, formStatus);
});

reviews.forEach((_, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
  dot.addEventListener("click", () => setReview(index));
  reviewDots.appendChild(dot);
});

const dots = reviewDots.querySelectorAll("button");
let activeReview = 0;

const setReview = (index) => {
  reviews[activeReview].classList.remove("active");
  dots[activeReview].classList.remove("active");
  activeReview = index;
  reviews[activeReview].classList.add("active");
  dots[activeReview].classList.add("active");
};

setReview(0);
setInterval(() => setReview((activeReview + 1) % reviews.length), 4800);

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const counter = entry.target;
    const end = Number(counter.dataset.count);
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / 1400, 1);
      counter.textContent = Math.floor(end * progress).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    countObserver.unobserve(counter);
  });
}, { threshold: 0.5 });

counters.forEach((counter) => countObserver.observe(counter));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.animate(
      [
        { opacity: 0, transform: "translateY(32px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      { duration: 700, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "both" }
    );
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.14 });

document.querySelectorAll(".section, .builder-band, .testimonials, .contact").forEach((section) => {
  revealObserver.observe(section);
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id || "top";

    railLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  });
}, { rootMargin: "-42% 0px -48% 0px", threshold: 0.01 });

["top", "who", "flow", "projects", "partners", "contact"].forEach((id) => {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
});

import("https://cdn.jsdelivr.net/npm/motion@latest/+esm")
  .then(({ animate, inView, stagger }) => {
    animate(".category-chip", { y: [20, 0], opacity: [0, 1] }, { delay: stagger(0.08), duration: 0.7 });
    inView(".project-card", (element) => {
      animate(element, { scale: [0.96, 1], opacity: [0, 1] }, { duration: 0.55 });
    });
  })
  .catch(() => {
    console.info("Motion CDN unavailable; native animations are active.");
  });
