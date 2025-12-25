(function () {
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // reveal
  const els = Array.from(document.querySelectorAll(".js-reveal"));
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add("is-visible"));
  }

  const modal = document.getElementById("modal");
  const body = document.getElementById("modal-body");

  function openModal(html) {
    if (!modal || !body) return;
    body.innerHTML = html;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  if (modal) {
    document.addEventListener("click", (e) => {
      const openBtn = e.target.closest("[data-open-modal='true']");
      if (openBtn) {
        const admin = openBtn.getAttribute("data-admin");
        const code = openBtn.getAttribute("data-code");
        openModal(`
          <p>Напиши в Telegram администратору: <b>${admin}</b></p>
          <p>И отправь кодовую фразу:</p>
          <p class="code">${code}</p>
        `);
        return;
      }
      if (e.target.matches("[data-close='true']") || e.target.closest("[data-close='true']")) closeModal();
    });

    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }
})();

(function () {
  const root = document.querySelector("[data-album]");
  if (!root) return;

  const track = root.querySelector("[data-album-track]");
  const slides = Array.from(root.querySelectorAll("[data-slide]"));
  const prev = root.querySelector("[data-album-prev]");
  const next = root.querySelector("[data-album-next]");
  const dotsWrap = root.querySelector("[data-album-dots]");
  const currentEl = root.querySelector("[data-album-current]");
  const totalEl = root.querySelector("[data-album-total]");

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!slides.length) return;
  if (totalEl) totalEl.textContent = String(slides.length);

  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "album__dot";
    b.setAttribute("aria-label", `Фото ${i + 1}`);
    b.setAttribute("data-dot", String(i));
    b.addEventListener("click", () => goTo(i));
    if (dotsWrap) dotsWrap.appendChild(b);
    return b;
  });

  function slideWidth() {
    return slides[0].getBoundingClientRect().width;
  }

  function clamp(n) {
    return Math.max(0, Math.min(slides.length - 1, n));
  }

  function setActive(i) {
    const idx = clamp(i);
    if (currentEl) currentEl.textContent = String(idx + 1);
    dots.forEach((d, k) => d.classList.toggle("is-active", k === idx));
    slides.forEach((s, k) => {
      if (k === idx) {
        s.setAttribute("aria-current", "true");
        s.removeAttribute("aria-hidden");
      } else {
        s.removeAttribute("aria-current");
        s.setAttribute("aria-hidden", "true");
      }
    });
  }

  function currentIndexByScroll() {
    const w = slideWidth() || 1;
    return clamp(Math.round(track.scrollLeft / w));
  }

  function goTo(i) {
    const idx = clamp(i);
    const w = slideWidth() || 1;
    track.scrollTo({ left: idx * w, behavior: reduceMotion ? "auto" : "smooth" });
    setActive(idx);
  }

  function step(dir) {
    goTo(currentIndexByScroll() + dir);
  }

  if (prev) prev.addEventListener("click", () => step(-1));
  if (next) next.addEventListener("click", () => step(1));

  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
    if (e.key === "Home") goTo(0);
    if (e.key === "End") goTo(slides.length - 1);
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        let best = null;
        for (const ent of entries) {
          if (!best || ent.intersectionRatio > best.intersectionRatio) best = ent;
        }
        if (best && best.isIntersecting) {
          const idx = slides.indexOf(best.target);
          if (idx >= 0) setActive(idx);
        }
      },
      { root: track, threshold: [0.5, 0.6, 0.7, 0.8, 0.9] }
    );
    slides.forEach((s) => io.observe(s));
  } else {
    let t = null;
    track.addEventListener("scroll", () => {
      clearTimeout(t);
      t = setTimeout(() => setActive(currentIndexByScroll()), 80);
    });
  }

  setActive(0);
})();
