// ============================================
// COMPLETE JAVASCRIPT FOR TANISHQ SINGH PORTFOLIO
// ============================================

// ============================================
// HEADER & NAVIGATION
// ============================================

const header = document.querySelector(".header")
const mobileMenuBtn = document.getElementById("mobileMenuBtn")
const mobileNav = document.getElementById("mobileNav")
const mobileNavToggles = document.querySelectorAll(".mobile-nav-toggle")
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link")
const navLinks = document.querySelectorAll(".nav-link")

// Sticky header on scroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.classList.add("scrolled")
  } else {
    header.classList.remove("scrolled")
  }
})

// Mobile menu toggle
mobileMenuBtn.addEventListener("click", () => {
  mobileMenuBtn.classList.toggle("active")
  mobileNav.classList.toggle("active")
})

// Mobile dropdown toggles
mobileNavToggles.forEach((toggle) => {
  toggle.addEventListener("click", (e) => {
    e.preventDefault()
    const dropdown = toggle.nextElementSibling
    dropdown.classList.toggle("active")

    // Close other dropdowns
    mobileNavToggles.forEach((otherToggle) => {
      if (otherToggle !== toggle) {
        otherToggle.nextElementSibling.classList.remove("active")
      }
    })
  })
})

// Close mobile menu when clicking on a link
mobileNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenuBtn.classList.remove("active")
    mobileNav.classList.remove("active")
  })
})

// Update active nav link based on scroll position
window.addEventListener("scroll", () => {
  updateActiveNavLink()
})

function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id]")
  let current = ""

  sections.forEach((section) => {
    const sectionTop = section.offsetTop
    const sectionHeight = section.clientHeight
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute("id")
    }
  })

  navLinks.forEach((link) => {
    link.classList.remove("active")
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active")
    }
  })
}

// ============================================
// SMOOTH SCROLL BEHAVIOR
// ============================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// ============================================
// CONTACT FORM
// ============================================

const contactForm = document.getElementById("contactForm")
const formMessage = document.getElementById("formMessage")

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const formData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      subject: document.getElementById("subject").value.trim(),
      message: document.getElementById("message").value.trim(),
    }

    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showFormMessage("Please fill in all fields", "error")
      return
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showFormMessage("Please enter a valid email address", "error")
      return
    }

    // Validate message length
    if (formData.message.length < 10) {
      showFormMessage("Message must be at least 10 characters long", "error")
      return
    }

    // Simulate form submission
    console.log("Form submitted:", formData)

    // Show success message
    showFormMessage("Message sent successfully! I'll get back to you soon.", "success")

    // Reset form
    contactForm.reset()

    // Hide message after 5 seconds
    setTimeout(() => {
      formMessage.classList.remove("success", "error")
    }, 5000)
  })
}

function showFormMessage(message, type) {
  formMessage.textContent = message
  formMessage.classList.remove("success", "error")
  formMessage.classList.add(type)
}

// ============================================
// ANIMATIONS ON SCROLL
// ============================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -100px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = `${entry.target.className.match(/animate-\w+/)?.[0]?.replace("animate-", "") || "slide-up"} 0.8s ease-out forwards`
      observer.unobserve(entry.target)
    }
  })
}, observerOptions)

// Observe all animated elements
document.querySelectorAll('[class*="animate-"]').forEach((el) => {
  observer.observe(el)
})

// ============================================
// MOUSE TRACKING EFFECT
// ============================================

let mouseX = 0
let mouseY = 0

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
})

// ============================================
// PARALLAX EFFECT
// ============================================

window.addEventListener("scroll", () => {
  const blobs = document.querySelectorAll(".gradient-blob")
  const scrollY = window.scrollY

  blobs.forEach((blob, index) => {
    const speed = 0.5 + index * 0.1
    blob.style.transform = `translateY(${scrollY * speed}px)`
  })
})

// ============================================
// CARD HOVER EFFECTS
// ============================================

const cards = document.querySelectorAll(
  ".feature-card, .project-card, .profile-card, .social-card, .experience-item, .education-item, .cert-item, .achievement-card, .service-card, .consultancy-card, .more-service-card, .pricing-card, .contact-info-card, .support-card",
)

cards.forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "scale(1.05)"
  })

  card.addEventListener("mouseleave", function () {
    this.style.transform = "scale(1)"
  })
})

// ============================================
// DROPDOWN MENU INTERACTIONS
// ============================================

const dropdownToggles = document.querySelectorAll(".dropdown-toggle")

dropdownToggles.forEach((toggle) => {
  toggle.addEventListener("click", (e) => {
    e.preventDefault()
  })
})

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function for performance
function throttle(func, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// ============================================
// PAGE LOAD ANIMATIONS
// ============================================

window.addEventListener("load", () => {
  // Add loaded class to body
  document.body.classList.add("loaded")

  // Trigger animations for visible elements
  document.querySelectorAll('[class*="animate-"]').forEach((el, index) => {
    setTimeout(() => {
      el.style.animation = `slide-up 0.8s ease-out forwards`
    }, index * 100)
  })
})

// ============================================
// ACCESSIBILITY IMPROVEMENTS
// ============================================

// Keyboard navigation for dropdowns
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // Close mobile menu
    mobileMenuBtn.classList.remove("active")
    mobileNav.classList.remove("active")

    // Close mobile dropdowns
    document.querySelectorAll(".mobile-dropdown").forEach((dropdown) => {
      dropdown.classList.remove("active")
    })
  }
})

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Lazy load images (if any)
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.add("loaded")
        observer.unobserve(img)
      }
    })
  })

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img)
  })
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("Portfolio loaded successfully")
  updateActiveNavLink()
})

// Set current year dynamically
document.addEventListener("DOMContentLoaded", function() {
    const yearElement = document.getElementById("year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// ============================================
// EXPORT FOR EXTERNAL USE (if needed)
// ============================================

window.portfolio = {
  updateActiveNavLink,
  showFormMessage,
  debounce,
  throttle,
}
