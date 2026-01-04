(() => {
  "use strict";

  const doc = document.documentElement;
  const body = document.body;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  doc.classList.add("js");

  const preBar = $(".pre-bar i");
  const preCount = $(".pre-count");
  let preloaded = doc.classList.contains("loaded");

  function finishLoad() {
    if (preloaded) return;
    preloaded = true;
    doc.classList.add("loaded");
    startHeroTitle();
  }

  if (!prefersReduced && preBar && preCount) {
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + Math.random() * 16 + 6);
      preBar.style.width = p + "%";
      preCount.textContent = String(Math.floor(p)).padStart(3, "0") + " %";
      if (p >= 100) clearInterval(tick);
    }, 90);
  }

  window.addEventListener("load", () => setTimeout(finishLoad, prefersReduced ? 0 : 350));
  setTimeout(finishLoad, 2600); 

  const cursorDot = $(".cursor-dot");
  const cursorRing = $(".cursor-ring");
  const cursorLabel = $(".cursor-label");

  if (cursorDot && cursorRing && finePointer && !prefersReduced) {
    doc.classList.add("has-cursor");
    let mx = innerWidth / 2;
    let my = innerHeight / 2;
    let rx = mx;
    let ry = my;

    addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    const hoverSel = "a, button, [role='button'], input, textarea, label, .skill-chip, .subnav-chip";

    document.addEventListener("mouseover", (e) => {
      const labelled = e.target.closest("[data-cursor]");
      if (labelled) {
        cursorLabel.textContent = labelled.dataset.cursor;
        cursorRing.classList.add("has-label");
        cursorRing.classList.remove("is-hover");
        return;
      }
      if (e.target.closest(hoverSel)) {
        cursorRing.classList.add("is-hover");
        cursorRing.classList.remove("has-label");
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("[data-cursor]")) cursorRing.classList.remove("has-label");
      if (e.target.closest(hoverSel)) cursorRing.classList.remove("is-hover");
    });

    document.addEventListener("mousedown", () => (cursorRing.style.scale = "0.82"));
    document.addEventListener("mouseup", () => (cursorRing.style.scale = "1"));
  }

  const header = $(".site-header");
  const progressBar = $(".scroll-progress i");
  const toTop = $(".to-top");
  const toTopRing = toTop ? toTop.querySelector("circle") : null;
  const RING_LEN = 163.4;
  const timelineWrap = $("#work .timeline");
  const tlFill = timelineWrap ? $(".tl-fill", timelineWrap) : null;
  const subnavChips = $$("[data-subnav]");

  let ticking = false;

  function onScroll() {
    const y = scrollY;

    if (header) header.classList.toggle("scrolled", y > 40);

    if (progressBar) {
      const max = doc.scrollHeight - innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }

    if (toTop) {
      toTop.classList.toggle("show", y > 560);
      if (toTopRing) {
        const max = doc.scrollHeight - innerHeight;
        toTopRing.style.strokeDashoffset = RING_LEN * (1 - (max > 0 ? y / max : 0));
      }
    }

    if (tlFill && timelineWrap) {
      const r = timelineWrap.getBoundingClientRect();
      const progress = (innerHeight * 0.62 - r.top) / r.height;
      tlFill.style.height = `${Math.max(0, Math.min(1, progress)) * 100}%`;
    }

    updateSubnav(y);
    ticking = false;
  }

  addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  function updateSubnav(y) {
    if (!subnavChips.length) return;
    const probe = y + innerHeight * 0.32;
    let currentId = null;
    subnavChips.forEach((chip) => {
      const target = document.getElementById(chip.dataset.subnav);
      if (target && target.offsetTop <= probe) currentId = chip.dataset.subnav;
    });
    subnavChips.forEach((chip) => chip.classList.toggle("active", chip.dataset.subnav === currentId));
  }

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + scrollY - innerHeight * 0.06;
      scrollTo({ top: Math.max(0, top), behavior: prefersReduced ? "auto" : "smooth" });
      closeDrawer();
    });
  });

  const burger = $(".burger");
  const drawer = $(".mobile-drawer");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("open");
    burger.classList.add("active");
    burger.setAttribute("aria-expanded", "true");
    body.classList.add("no-scroll");
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    if (burger) {
      burger.classList.remove("active");
      burger.setAttribute("aria-expanded", "false");
    }
    body.classList.remove("no-scroll");
  }

  if (burger && drawer) {
    burger.addEventListener("click", () =>
      drawer.classList.contains("open") ? closeDrawer() : openDrawer()
    );
    $$(".m-link", drawer).forEach((l) => l.addEventListener("click", closeDrawer));
  }

  $$(".m-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const group = toggle.closest(".m-group");
      const isOpen = group.classList.contains("open");
      $$(".m-group.open").forEach((g) => g.classList.remove("open"));
      if (!isOpen) group.classList.add("open");
    });
  });

  $$(".nav-drop > .drop-toggle").forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const drop = toggle.closest(".nav-drop");
      const wasOpen = drop.classList.contains("open");
      $$(".nav-drop.open").forEach((d) => d.classList.remove("open"));
      if (!wasOpen) drop.classList.add("open");
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-drop")) $$(".nav-drop.open").forEach((d) => d.classList.remove("open"));
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$("[data-reveal]").forEach((el) => revealObserver.observe(el));

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const dur = 1500;
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(frame);
  }

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );
  $$("[data-count]").forEach((el) => {
    if (prefersReduced) {
      el.textContent = parseFloat(el.dataset.count).toFixed(parseInt(el.dataset.decimals || "0", 10));
    } else {
      countObserver.observe(el);
    }
  });

  if (finePointer) {
    $$("[data-spot]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  if (finePointer && !prefersReduced) {
    $$("[data-tilt]").forEach((card) => {
      const strength = parseFloat(card.dataset.tilt) || 7;
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-py * strength).toFixed(2)}deg) rotateY(${(px * strength).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  if (finePointer && !prefersReduced) {
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.translate = `${dx * 0.18}px ${dy * 0.28}px`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.translate = "";
      });
    });
  }

  function startHeroTitle() {
    $$(".hero-title .wi").forEach((w) => w.classList.add("in"));
  }

  const typeEl = $(".type-text");
  if (typeEl && !prefersReduced) {
    const words = JSON.parse(typeEl.dataset.words || '[]');
    if (words.length) {
      let wi = 0;
      let ci = 0;
      let deleting = false;

      (function type() {
        const word = words[wi];
        typeEl.textContent = word.slice(0, ci);
        let delay = deleting ? 34 : 74;

        if (!deleting && ci === word.length) {
          delay = 2100;
          deleting = true;
        } else if (deleting && ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
          delay = 420;
        } else {
          ci += deleting ? -1 : 1;
        }
        setTimeout(type, delay);
      })();
    }
  }

  const codeBody = $(".code-body");
  if (codeBody && !prefersReduced) {
    const CODE = [
      [["tk-cm", "// hi, I'm Tanishq 👋"]],
      [["tk-kw", "const "], ["tk-var", "tanishq"], ["tk-p", " = {"]],
      [["tk-k", "  role"], ["tk-p", ": "], ["tk-str", "'Software Developer'"], ["tk-p", ","]],
      [["tk-k", "  stack"], ["tk-p", ": ["], ["tk-str", "'React'"], ["tk-p", ", "], ["tk-str", "'Next.js'"], ["tk-p", ", "], ["tk-str", "'Node.js'"], ["tk-p", "],"]],
      [["tk-k", "  also"], ["tk-p", ": ["], ["tk-str", "'Selenium'"], ["tk-p", ", "], ["tk-str", "'Docker'"], ["tk-p", ", "], ["tk-str", "'K8s'"], ["tk-p", "],"]],
      [["tk-k", "  focus"], ["tk-p", ": "], ["tk-str", "'scalable web apps'"], ["tk-p", ","]],
      [["tk-k", "  openToWork"], ["tk-p", ": "], ["tk-kw", "true"], ["tk-p", ","]],
      [["tk-p", "};"]],
      [["tk-cm", "// always shipping →"]],
      [["tk-kw", "while"], ["tk-p", " ("], ["tk-var", "alive"], ["tk-p", ") { "], ["tk-var", "code"], ["tk-p", "(); "], ["tk-var", "ship"], ["tk-p", "(); "], ["tk-var", "learn"], ["tk-p", "(); }"]],
    ];

    let line = 0;
    let token = 0;
    let char = 0;
    let currentSpan = null;
    let currentLineEl = null;
    const caret = document.createElement("span");
    caret.className = "type-caret small";

    function typeCode() {
      if (line >= CODE.length) {
        setTimeout(() => {
          codeBody.innerHTML = "";
          line = 0;
          token = 0;
          char = 0;
          currentSpan = null;
          typeCode();
        }, 4200);
        return;
      }

      if (!currentLineEl) {
        currentLineEl = document.createElement("div");
        const num = document.createElement("span");
        num.className = "ln";
        num.textContent = String(line + 1).padStart(2, " ") + "  ";
        currentLineEl.appendChild(num);
        codeBody.appendChild(currentLineEl);
        currentLineEl.appendChild(caret);
      }

      const tokens = CODE[line];
      if (token >= tokens.length) {
        line += 1;
        token = 0;
        char = 0;
        currentSpan = null;
        currentLineEl = null;
        setTimeout(typeCode, 90);
        return;
      }

      const [cls, text] = tokens[token];
      if (!currentSpan) {
        currentSpan = document.createElement("span");
        currentSpan.className = cls;
        currentLineEl.insertBefore(currentSpan, caret);
      }

      if (char < text.length) {
        currentSpan.textContent += text[char];
        char += 1;
        setTimeout(typeCode, 14 + Math.random() * 26);
      } else {
        token += 1;
        char = 0;
        currentSpan = null;
        setTimeout(typeCode, 12);
      }
    }
    typeCode();
  }

  (function initParticles() {
    const canvas = $("#particles");
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let pts = [];
    let raf = null;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(120, Math.floor((w * h) / 15000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.5 + 0.6,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      for (const p of pts) {
        const dxm = mouse.x - p.x;
        const dym = mouse.y - p.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 170 && dm > 0.001) {
          p.vx += (dxm / dm) * 0.012;
          p.vy += (dym / dm) * 0.012;
        }

        p.x += p.vx;
        p.y += p.vy;

        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 0.8) {
          p.vx = (p.vx / sp) * 0.8;
          p.vy = (p.vy / sp) * 0.8;
        }

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            const alpha = (1 - d / 130) * 0.32;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of pts) {
        ctx.fillStyle = "rgba(190, 205, 255, 0.75)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    }

    const hero = canvas.closest(".hero");
    if (hero) {
      hero.addEventListener("pointermove", (e) => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      });
      hero.addEventListener("pointerleave", () => {
        mouse.x = -9999;
        mouse.y = -9999;
      });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = null;
      } else if (!raf) {
        raf = requestAnimationFrame(step);
      }
    });

    addEventListener("resize", resize);
    resize();
    raf = requestAnimationFrame(step);
  })();

  const cmdk = $(".cmdk");
  if (cmdk) {
    const input = $(".cmdk-input", cmdk);
    const list = $(".cmdk-list", cmdk);
    const PAGES = [
      { label: "Home", path: "/", href: "index.html" },
      { label: "About Me", path: "/about", href: "about.html#bio" },
      { label: "Coding Profile", path: "/about", href: "about.html#coding" },
      { label: "Download CV", path: "/about", href: "about.html#download" },
      { label: "Work Experience", path: "/experience", href: "experience.html#work" },
      { label: "Education", path: "/experience", href: "experience.html#education" },
      { label: "Certifications", path: "/experience", href: "experience.html#certifications" },
      { label: "Achievements", path: "/experience", href: "experience.html#achievements" },
      { label: "Technical Skills", path: "/experience", href: "experience.html#skills" },
      { label: "Personal Projects", path: "/projects", href: "projects.html#personal" },
      { label: "Research Works", path: "/projects", href: "projects.html#research" },
      { label: "Open Source", path: "/projects", href: "projects.html#opensource" },
      { label: "Development Services", path: "/services", href: "services.html#products" },
      { label: "Consultancy", path: "/services", href: "services.html#consultancy" },
      { label: "Additional Services", path: "/services", href: "services.html#more" },
      { label: "Contact Me", path: "/contact", href: "contact.html" },
    ];
    let items = [];
    let active = 0;

    function renderList(q) {
      const query = q.trim().toLowerCase();
      items = PAGES.filter(
        (p) => !query || p.label.toLowerCase().includes(query) || p.path.includes(query)
      );
      active = 0;
      if (!items.length) {
        list.innerHTML = `<div class="cmdk-empty">No results — try “projects” or “contact”.</div>`;
        return;
      }
      list.innerHTML = items
        .map(
          (p, i) => `
          <div class="cmdk-item ${i === active ? "active" : ""}" data-href="${p.href}" role="option">
            <span>${p.label}</span><span class="path">${p.path}</span>
          </div>`
        )
        .join("");
    }

    function paintActive() {
      $$(".cmdk-item", list).forEach((el, i) => el.classList.toggle("active", i === active));
      const el = $$(".cmdk-item", list)[active];
      if (el) el.scrollIntoView({ block: "nearest" });
    }

    function openCmdk() {
      cmdk.classList.add("open");
      body.classList.add("no-scroll");
      input.value = "";
      renderList("");
      setTimeout(() => input.focus(), 60);
    }

    function closeCmdk() {
      cmdk.classList.remove("open");
      body.classList.remove("no-scroll");
    }

    function go(href) {
      closeCmdk();
      const [page, hash] = href.split("#");
      if (hash && location.pathname.endsWith(page)) {
        const target = document.getElementById(hash);
        if (target) {
          scrollTo({ top: target.getBoundingClientRect().top + scrollY - innerHeight * 0.06, behavior: "smooth" });
          return;
        }
      }
      location.href = href;
    }

    addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        cmdk.classList.contains("open") ? closeCmdk() : openCmdk();
        return;
      }
      if (!cmdk.classList.contains("open")) return;

      if (e.key === "Escape") closeCmdk();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        active = Math.min(items.length - 1, active + 1);
        paintActive();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        active = Math.max(0, active - 1);
        paintActive();
      } else if (e.key === "Enter" && items[active]) {
        e.preventDefault();
        go(items[active].href);
      }
    });

    input.addEventListener("input", () => renderList(input.value));
    list.addEventListener("click", (e) => {
      const item = e.target.closest(".cmdk-item");
      if (item) go(item.dataset.href);
    });
    cmdk.addEventListener("click", (e) => {
      if (e.target === cmdk) closeCmdk();
    });

    $$(".cmdk-btn").forEach((btn) => btn.addEventListener("click", openCmdk));
    renderList("");
  }

  $$("[data-copy]").forEach((btn) => {
    const original = btn.innerHTML;
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      btn.classList.add("copied");
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = original;
      }, 1800);
    });
  });

  const form = $("#contactForm");
  const formMsg = $("#formMessage");

  function showFormMessage(message, type) {
    if (!formMsg) return;
    formMsg.textContent = message;
    formMsg.classList.remove("success", "error", "show");
    void formMsg.offsetWidth; 
    formMsg.classList.add(type, "show");
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fields = {
        name: $("#name"),
        email: $("#email"),
        subject: $("#subject"),
        message: $("#message"),
      };

      Object.values(fields).forEach((f) => f.closest(".field").classList.remove("invalid"));

      const data = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        subject: fields.subject.value.trim(),
        message: fields.message.value.trim(),
      };

      const fail = (el, msg) => {
        el.closest(".field").classList.add("invalid");
        el.focus();
        showFormMessage(msg, "error");
      };

      if (!data.name) return fail(fields.name, "Please tell me your name.");
      if (!data.email) return fail(fields.email, "Please add your email address.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        return fail(fields.email, "Please enter a valid email address.");
      if (!data.subject) return fail(fields.subject, "Please add a subject line.");
      if (!data.message) return fail(fields.message, "Please write a short message.");
      if (data.message.length < 10)
        return fail(fields.message, "Message must be at least 10 characters long.");

      const submitBtn = $(".submit-btn", form);
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
        console.info("Contact form submitted:", data);
        showFormMessage("Message sent successfully! I'll get back to you soon. ✓", "success");
        form.reset();
        setTimeout(() => formMsg.classList.remove("show"), 6000);
      }, 1100);
    });
  }

  const tlDescs = $$(".tl-desc");

  function renderTlDesc(el) {
    const mobile = innerWidth <= 820;
    const expanded = el.dataset.expanded === "1";
    const source = mobile && !expanded ? el.dataset.short : el.dataset.full;
    const items = (source || "").split("|").map((s) => s.trim()).filter(Boolean);
    el.innerHTML = `<ul>${items.map((s) => `<li>${s}</li>`).join("")}</ul>`;
    const btn = el.parentElement.querySelector(".tl-more");
    if (btn) {
      btn.style.display = mobile ? "inline-flex" : "none";
      const label = btn.querySelector(".tl-more-label");
      if (label) label.textContent = expanded ? "Show less" : "Read full story";
      btn.classList.toggle("open", expanded);
    }
  }

  tlDescs.forEach(renderTlDesc);

  $$(".tl-more").forEach((btn) => {
    btn.addEventListener("click", () => {
      const desc = btn.parentElement.querySelector(".tl-desc");
      if (!desc) return;
      desc.dataset.expanded = desc.dataset.expanded === "1" ? "0" : "1";
      renderTlDesc(desc);
    });
  });

  let tlResizeTimer = null;
  addEventListener("resize", () => {
    clearTimeout(tlResizeTimer);
    tlResizeTimer = setTimeout(() => tlDescs.forEach(renderTlDesc), 160);
  });

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeDrawer();
    $$(".nav-drop.open").forEach((d) => d.classList.remove("open"));
  });
})();
