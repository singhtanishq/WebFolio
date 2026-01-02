const header = document.querySelector(".header")
const mobileMenuBtn = document.getElementById("mobileMenuBtn")
const mobileNav = document.getElementById("mobileNav")
const mobileNavToggles = document.querySelectorAll(".mobile-nav-toggle")
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link")
const navLinks = document.querySelectorAll(".nav-link")

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.classList.add("scrolled")
  } else {
    header.classList.remove("scrolled")
  }
})

mobileMenuBtn.addEventListener("click", () => {
  mobileMenuBtn.classList.toggle("active")
  mobileNav.classList.toggle("active")
})

mobileNavToggles.forEach((toggle) => {
  toggle.addEventListener("click", (e) => {
    e.preventDefault()
    const dropdown = toggle.nextElementSibling
    dropdown.classList.toggle("active")

    mobileNavToggles.forEach((otherToggle) => {
      if (otherToggle !== toggle) {
        otherToggle.nextElementSibling.classList.remove("active")
      }
    })
  })
})

mobileNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenuBtn.classList.remove("active")
    mobileNav.classList.remove("active")
  })
})

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

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showFormMessage("Please fill in all fields", "error")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showFormMessage("Please enter a valid email address", "error")
      return
    }

    if (formData.message.length < 10) {
      showFormMessage("Message must be at least 10 characters long", "error")
      return
    }

    console.log("Form submitted:", formData)

    showFormMessage("Message sent successfully! I'll get back to you soon.", "success")

    contactForm.reset()

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

document.querySelectorAll('[class*="animate-"]').forEach((el) => {
  observer.observe(el)
})

let mouseX = 0
let mouseY = 0

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
})

window.addEventListener("scroll", () => {
  const blobs = document.querySelectorAll(".gradient-blob")
  const scrollY = window.scrollY

  blobs.forEach((blob, index) => {
    const speed = 0.5 + index * 0.1
    blob.style.transform = `translateY(${scrollY * speed}px)`
  })
})

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

const dropdownToggles = document.querySelectorAll(".dropdown-toggle")

dropdownToggles.forEach((toggle) => {
  toggle.addEventListener("click", (e) => {
    e.preventDefault()
  })
})

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

window.addEventListener("load", () => {
  document.body.classList.add("loaded")

  document.querySelectorAll('[class*="animate-"]').forEach((el, index) => {
    setTimeout(() => {
      el.style.animation = `slide-up 0.8s ease-out forwards`
    }, index * 100)
  })
})

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    mobileMenuBtn.classList.remove("active")
    mobileNav.classList.remove("active")

    document.querySelectorAll(".mobile-dropdown").forEach((dropdown) => {
      dropdown.classList.remove("active")
    })
  }
})

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

document.addEventListener("DOMContentLoaded", () => {
  console.log("Portfolio loaded successfully")
  updateActiveNavLink()
})

document.addEventListener("DOMContentLoaded", function() {
    const yearElement = document.getElementById("year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

function updateTimelineDescriptions() {
  document.querySelectorAll(".timeline-description").forEach((el) => {
    const full = el.getAttribute("data-full");
    const short = el.getAttribute("data-short");

    if (window.innerWidth > 768) {
      el.innerHTML = full.replace(/\n/g, "<br>");
      el.style.textAlign = "justify";
    } else {
      el.innerHTML = short.replace(/\n/g, "<br>");
      el.style.textAlign = "left";
    }
  });
}

updateTimelineDescriptions();

window.addEventListener("resize", updateTimelineDescriptions);

window.portfolio = {
  updateActiveNavLink,
  showFormMessage,
  debounce,
  throttle,
}
