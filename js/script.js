
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const overlay = document.querySelector(".mobile-overlay");
  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  overlay?.addEventListener("click", closeMenu);
  document.querySelectorAll(".sidebar-nav a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  // Mark the current page in the sidebar.
  const currentPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".sidebar-nav a").forEach(link => {
    const target = link.getAttribute("href").split("/").pop();
    if (target === currentPage) link.classList.add("active");
  });

  // Reveal sections as they enter the viewport.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  // Slim reading progress indicator.
  const progress = document.querySelector(".progress-bar");
  const updateProgress = () => {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${percentage}%`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // Show the introduction video only when the local video file is present.
  document.querySelectorAll("[data-local-video]").forEach(frame => {
    const video = frame.querySelector("video");
    video?.addEventListener("loadedmetadata", () => frame.classList.add("has-video"));
    video?.addEventListener("error", () => frame.classList.remove("has-video"));
  });

  // Formspree: replace YOUR_FORM_ID in comments.html with your own endpoint ID.
  const commentsForm = document.querySelector("#comments-form");
  commentsForm?.addEventListener("submit", async event => {
    const endpoint = commentsForm.getAttribute("action") || "";
    const status = document.querySelector("#form-status");
    if (endpoint.includes("YOUR_FORM_ID")) {
      event.preventDefault();
      status.textContent = "The form is ready, but it has not been connected yet. Create a Formspree form and replace YOUR_FORM_ID in comments.html.";
      status.className = "form-status show info";
      return;
    }
    event.preventDefault();
    const submitButton = commentsForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(commentsForm),
        headers: { Accept: "application/json" }
      });
      if (response.ok) {
        commentsForm.reset();
        status.textContent = "Thank you! Your feedback has been submitted successfully.";
        status.className = "form-status show info";
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      status.textContent = "Sorry, your feedback could not be submitted. Please check your connection or try again later.";
      status.className = "form-status show error";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
});
