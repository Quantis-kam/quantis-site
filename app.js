/* ==========================================================================
   QUANTIS — L'Ingénierie de Demain
   Per-Section Particle Constellations — No Visible Containers
   Each section has its own shape, particles float freely (no box feeling)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PRELOADER
  // ═══════════════════════════════════════════════════════════════════════════
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => {
    setTimeout(() => { if (preloader) preloader.classList.add("fade-out"); }, 400);
  });
  setTimeout(() => {
    if (preloader && !preloader.classList.contains("fade-out")) preloader.classList.add("fade-out");
  }, 2000);

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. NAVBAR
  // ═══════════════════════════════════════════════════════════════════════════
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 40);
  });

  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      const isVisible = navMenu.style.display === "flex";
      navMenu.style.display = isVisible ? "none" : "flex";
      if (!isVisible) {
        Object.assign(navMenu.style, {
          position: "absolute", top: "var(--header-h)", left: "0", right: "0",
          flexDirection: "column", background: "rgba(8, 8, 12, 0.96)",
          backdropFilter: "blur(24px)", padding: "28px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)", zIndex: "999", gap: "20px"
        });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SCROLL REVEAL
  // ═══════════════════════════════════════════════════════════════════════════
  const revealElements = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("revealed"), i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  revealElements.forEach(el => revealObserver.observe(el));

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. AMBIENT 2D STARFIELD BACKGROUND
  // ═══════════════════════════════════════════════════════════════════════════
  const bgCanvas = document.getElementById("bg-canvas");
  if (bgCanvas) {
    const ctx = bgCanvas.getContext("2d");
    let width = (bgCanvas.width = window.innerWidth);
    let height = (bgCanvas.height = window.innerHeight);
    window.addEventListener("resize", () => {
      width = bgCanvas.width = window.innerWidth;
      height = bgCanvas.height = window.innerHeight;
      initBgStars();
    });

    let stars = [];
    const starColors = [
      "rgba(255, 255, 255,", "rgba(255, 255, 255,", "rgba(255, 235, 190,",
      "rgba(147, 197, 253,", "rgba(56, 189, 248,", "rgba(197, 160, 89,"
    ];

    function initBgStars() {
      stars = [];
      for (let i = 0; i < 450; i++) {
        const colorPrefix = starColors[Math.floor(Math.random() * starColors.length)];
        const isBright = Math.random() > 0.94;
        stars.push({
          x: Math.random() * width, y: Math.random() * height,
          radius: isBright ? (Math.random() * 1.3 + 1.0) : (Math.random() * 0.8 + 0.3),
          baseAlpha: isBright ? (Math.random() * 0.4 + 0.6) : (Math.random() * 0.35 + 0.15),
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2, colorPrefix
        });
      }
    }
    initBgStars();

    let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
    window.addEventListener("mousemove", (e) => {
      targetMouseX = (e.clientX / width - 0.5) * 25;
      targetMouseY = (e.clientY / height - 0.5) * 20;
    });

    let tick = 0;
    function renderBg() {
      tick++;
      ctx.clearRect(0, 0, width, height);
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;
      for (const s of stars) {
        const alpha = Math.max(0.08, Math.min(1, s.baseAlpha + Math.sin(tick * s.twinkleSpeed + s.twinklePhase) * 0.25));
        const px = s.x + mouseX * 0.3;
        const py = s.y + mouseY * 0.3;
        ctx.beginPath();
        ctx.arc(px, py, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${s.colorPrefix} ${alpha})`;
        ctx.fill();
        if (s.radius > 1.1 && alpha > 0.65) {
          ctx.beginPath();
          ctx.arc(px, py, s.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `${s.colorPrefix} ${alpha * 0.25})`;
          ctx.fill();
        }
      }
      requestAnimationFrame(renderBg);
    }
    renderBg();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. THREE.JS — PER-SECTION PARTICLE CONSTELLATIONS
  //    Each section has its OWN canvas with its OWN shape.
  //    Containers are full-width, borderless, transparent — NO BOX FEELING.
  //    Particles assemble when scrolled into view, disperse when leaving.
  // ═══════════════════════════════════════════════════════════════════════════
  if (typeof THREE !== "undefined") {

    // ── Celestial Star Textures (OpenAI Astra Exact Reference Fidelity) ──
    // 1. Pristine circular stellar disc (compact solid core + exponential astronomical falloff)
    function createDiscTexture() {
      const size = 128;
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const ctx = c.getContext("2d");
      const cx = size / 2;

      const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx * 0.72);
      g.addColorStop(0.00, "rgba(255, 255, 255, 1.0)");
      g.addColorStop(0.28, "rgba(255, 255, 255, 1.0)"); // Solid brilliant core
      g.addColorStop(0.48, "rgba(242, 248, 255, 0.75)");
      g.addColorStop(0.72, "rgba(195, 222, 255, 0.20)");
      g.addColorStop(0.88, "rgba(160, 200, 255, 0.03)");
      g.addColorStop(1.00, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);

      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    // 2. Radiant Diamond Star with needle-sharp 4-point diffraction cross (sparkle / lens flare)
    function createFlareTexture() {
      const size = 256;
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const ctx = c.getContext("2d");
      const cx = size / 2;

      // Diamond core
      const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx * 0.42);
      g.addColorStop(0.00, "rgba(255, 255, 255, 1.0)");
      g.addColorStop(0.20, "rgba(255, 255, 255, 1.0)");
      g.addColorStop(0.42, "rgba(240, 248, 255, 0.75)");
      g.addColorStop(0.68, "rgba(180, 215, 255, 0.20)");
      g.addColorStop(1.00, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);

      // 4 needle-sharp diffraction cross spikes
      ctx.globalCompositeOperation = "screen";
      const drawSpike = (x1, y1, x2, y2, w) => {
        const sg = ctx.createLinearGradient(x1, y1, x2, y2);
        sg.addColorStop(0.00, "rgba(255, 255, 255, 0)");
        sg.addColorStop(0.30, "rgba(225, 242, 255, 0.35)");
        sg.addColorStop(0.50, "rgba(255, 255, 255, 1.0)");
        sg.addColorStop(0.70, "rgba(225, 242, 255, 0.35)");
        sg.addColorStop(1.00, "rgba(255, 255, 255, 0)");
        ctx.strokeStyle = sg;
        ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      };

      // Primary needle spikes
      drawSpike(4, cx, size - 4, cx, 1.8);
      drawSpike(cx, 4, cx, size - 4, 1.8);

      // Secondary luminous core spikes
      drawSpike(cx - 55, cx, cx + 55, cx, 3.2);
      drawSpike(cx, cx - 55, cx, cx + 55, 3.2);

      // Subtle 45° diagonal glints
      drawSpike(cx - 40, cx - 40, cx + 40, cx + 40, 0.95);
      drawSpike(cx + 40, cx - 40, cx - 40, cx + 40, 0.95);

      ctx.globalCompositeOperation = "source-over";
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    const discTexture = createDiscTexture();
    const flareTexture = createFlareTexture();

    // Astronomical palette: pure diamond white, ice blues, soft peach/apricot/amber
    const palette = [
      new THREE.Color(0xffffff), // Pure diamond white
      new THREE.Color(0xffffff), // Pure diamond white
      new THREE.Color(0xf6faff), // Diamond ice
      new THREE.Color(0xd4eaff), // Ice Blue
      new THREE.Color(0x9eccff), // Celestial Azure
      new THREE.Color(0x72b4ff), // Deep Sky Blue
      new THREE.Color(0xfff2e6), // Warm Ivory
      new THREE.Color(0xffd4b8), // Warm Peach
      new THREE.Color(0xffb890), // Radiant Apricot
      new THREE.Color(0xff9e6b), // Amber Sunset
      new THREE.Color(0xff8c52)  // Deep Coral
    ];

    // ── SHAPE GENERATORS (OPENAI ASTRA REFERENCE FIDELITY) ──
    // Discrete diamond stars with natural celestial spacing and zero over-saturation

    // 1. GALAXY (Hero) — Logarithmic spiral galaxy matching GPT-6 Astra hero
    function genGalaxy(N) {
      const p = new Float32Array(N * 3);
      const arms = 3, maxR = 12.0;
      for (let i = 0; i < N; i++) {
        if (i < N * 0.24) {
          // Dense central glowing stellar core
          const r = Math.pow(Math.random(), 2.0) * 3.0;
          const th = Math.random() * Math.PI * 2;
          p[i*3] = Math.cos(th) * r * 1.15;
          p[i*3+1] = Math.sin(th) * r * 0.82;
          p[i*3+2] = (Math.random() - 0.5) * 1.6 * (1 - r / 3.0);
        } else {
          // 3-arm logarithmic spiral stream
          const arm = i % arms;
          const off = (arm * 2 * Math.PI) / arms;
          const prog = Math.pow(Math.random(), 0.70);
          const r = 2.4 + prog * (maxR - 2.4);
          const th = prog * Math.PI * 2.8 + off + (Math.random() - 0.5) * 0.22;
          const sp = (Math.random() - 0.5) * (0.45 + 0.04 * r);
          p[i*3] = Math.cos(th) * (r + sp) * 1.15;
          p[i*3+1] = Math.sin(th) * (r + sp) * 0.82;
          p[i*3+2] = (Math.random() - 0.5) * 1.5 * Math.exp(-r / 8);
        }
      }
      return p;
    }

    // 2. MONOGRAMME Q & FLÈCHE D'ASCENDANCE (Manifeste) — Identité de Marque QUANTIS
    // Reproduction fidèle du logo officiel (logo.jpeg) : boucle Q pure, queue profilée et Flèche d'Or (↗)
    function genQ(N) {
      const p = new Float32Array(N * 3);
      const colors = new Array(N);

      // Répartition des particules : Boucle (~58%), Queue (~14%), Flèche (~22%), Halo (~6%)
      const ringN  = Math.floor(N * 0.58);
      const tailN  = Math.floor(N * 0.14);
      const arrowN = Math.floor(N * 0.22);
      const dustN  = N - ringN - tailN - arrowN;

      // Palette Or Solaire & Ambre pour la Flèche (conformément au logo officiel)
      const arrowGoldPalette = [
        new THREE.Color(0xffc247), // Or Quantis
        new THREE.Color(0xffd766), // Or étincelant diamant
        new THREE.Color(0xffad33), // Ambre chaud
        new THREE.Color(0xffe58f), // Or céleste pâle
        new THREE.Color(0xffffff)  // Étoile de diamant pur
      ];

      // Palette Céleste Pure pour le Q (Blanc diamant, azur et glace)
      const qBodyPalette = [
        new THREE.Color(0xffffff), // Blanc diamant
        new THREE.Color(0xffffff),
        new THREE.Color(0xf4f9ff), // Diamant glacier
        new THREE.Color(0xd4eaff), // Bleu givré
        new THREE.Color(0x9eccff), // Azur céleste
        new THREE.Color(0xfff2e6)  // Ivoire chaud
      ];

      const cx = -3.8, cy = 0.0;
      const Rx = 8.8, Ry = 10.6;

      // 2.1 Boucle du Q — Anneau pur avec intérieur sombre dégagé
      for (let i = 0; i < ringN; i++) {
        const th = (i / ringN) * Math.PI * 2;
        const strokeWidth = 0.65 + 0.9 * Math.pow(Math.cos(th), 2);
        const u = (Math.random() - 0.5) * strokeWidth;

        const nx = Math.cos(th) / Rx;
        const ny = Math.sin(th) / Ry;
        const nlen = Math.hypot(nx, ny) || 1;

        p[i*3]   = cx + Rx * Math.cos(th) + (nx / nlen) * u;
        p[i*3+1] = cy + Ry * Math.sin(th) + (ny / nlen) * u;
        p[i*3+2] = (Math.random() - 0.5) * 1.2;
        colors[i] = qBodyPalette[Math.floor(Math.random() * qBodyPalette.length)];
      }

      // 2.2 Queue du Q — Émergence élégante à 5h descendant vers le bas-droite (logo.jpeg)
      const p0 = [cx + 1.8, cy - 5.5];
      const p1 = [cx + 4.5, cy - 8.2];
      const p2 = [cx + 7.5, cy - 10.2];
      const p3 = [cx + 9.8, cy - 11.2];

      for (let i = 0; i < tailN; i++) {
        const idx = ringN + i;
        const t = i / tailN;
        const u = 1 - t;
        const bx = u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0];
        const by = u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1];
        const spread = (Math.random() - 0.5) * (1.1 * (1 - t * 0.3));

        p[idx*3]   = bx + spread;
        p[idx*3+1] = by + spread;
        p[idx*3+2] = (Math.random() - 0.5) * 1.2;
        colors[idx] = qBodyPalette[Math.floor(Math.random() * qBodyPalette.length)];
      }

      // 2.3 Flèche d'Ascendance (La Flèche Quantis) — Pointant à 45° (↗) à droite du Q
      // Positionnée à 3h30 avec un espacement sombre net vis-à-vis du Q
      const acx = 10.5, acy = 1.6;
      const cos45 = Math.SQRT1_2;
      const sin45 = Math.SQRT1_2;

      // Hampe de la flèche (Shaft)
      const shaftN = Math.floor(arrowN * 0.40);
      for (let i = 0; i < shaftN; i++) {
        const idx = ringN + tailN + i;
        const s = -2.6 + (i / shaftN) * 3.0; // le long de l'axe 45°
        const w = (Math.random() - 0.5) * 1.4; // largeur perpendiculaire
        p[idx*3]   = acx + s * cos45 - w * sin45;
        p[idx*3+1] = acy + s * sin45 + w * cos45;
        p[idx*3+2] = (Math.random() - 0.5) * 1.0;
        colors[idx] = arrowGoldPalette[Math.floor(Math.random() * arrowGoldPalette.length)];
      }

      // Pointe de la flèche (Arrowhead en chevron étincelant)
      const headN = arrowN - shaftN;
      for (let i = 0; i < headN; i++) {
        const idx = ringN + tailN + shaftN + i;
        let s, w;
        if (i < 36) {
          // Étoiles de contour pour une pointe incisive et des barbillons nets
          const t = i / 36;
          if (t < 0.42) {
            // Pointe (3.8, 0) vers barbillon gauche (0.4, -2.4)
            const sub = t / 0.42;
            s = 3.8 * (1 - sub) + 0.4 * sub;
            w = 0.0 * (1 - sub) + (-2.4) * sub;
          } else if (t < 0.84) {
            // Pointe (3.8, 0) vers barbillon droit (0.4, 2.4)
            const sub = (t - 0.42) / 0.42;
            s = 3.8 * (1 - sub) + 0.4 * sub;
            w = 0.0 * (1 - sub) + 2.4 * sub;
          } else {
            s = 0.4 + (Math.random() - 0.5) * 0.3;
            w = (Math.random() - 0.5) * 4.8;
          }
        } else {
          // Remplissage intérieur
          let r1 = Math.random(), r2 = Math.random();
          if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
          s = (1 - r1 - r2) * 3.8 + r1 * 0.4 + r2 * 0.4;
          w = (1 - r1 - r2) * 0.0 + r1 * (-2.4) + r2 * 2.4;
        }

        p[idx*3]   = acx + s * cos45 - w * sin45;
        p[idx*3+1] = acy + s * sin45 + w * cos45;
        p[idx*3+2] = (Math.random() - 0.5) * 1.0;

        if (i === 0 || i === 1) {
          colors[idx] = new THREE.Color(0xffffff); // Diamant pur pour le sommet
        } else {
          colors[idx] = arrowGoldPalette[Math.floor(Math.random() * arrowGoldPalette.length)];
        }
      }

      // 2.4 Poussière d'étoiles ambiante
      for (let i = 0; i < dustN; i++) {
        const idx = ringN + tailN + arrowN + i;
        const th = Math.random() * Math.PI * 2;
        const rad = 1.15 + Math.random() * 0.25;
        p[idx*3]   = cx + Rx * rad * Math.cos(th);
        p[idx*3+1] = cy + Ry * rad * Math.sin(th);
        p[idx*3+2] = (Math.random() - 0.5) * 2.2;
        colors[idx] = qBodyPalette[Math.floor(Math.random() * qBodyPalette.length)];
      }

      // Centrage parfait de l'ensemble (Q + Queue + Flèche) au point (0, 0, 0)
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (let i = 0; i < ringN + tailN + arrowN; i++) {
        const x = p[i*3], y = p[i*3+1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      const midX = (minX + maxX) * 0.5;
      const midY = (minY + maxY) * 0.5;
      for (let i = 0; i < N; i++) {
        p[i*3]   -= midX;
        p[i*3+1] -= midY;
      }

      return { positions: p, colors: colors };
    }

    // 3. ROUNDED DELTA LOOP (Benchmarks) — Exact reproduction of OpenAI Astra reference shape
    // Organic closed delta ribbon with rounded corners, sweeping contours, and inner aerodynamic cleft
    function genDeltaLoop(N) {
      const p = new Float32Array(N * 3);

      // 12 key knots defining the smooth aerodynamic delta loop from OpenAI Astra
      const knots = [
        new THREE.Vector3(-9.2, 9.6, 0),   // 1. Top-left lobe apex
        new THREE.Vector3(-3.5, 9.2, 0),   // 2. Upper camber
        new THREE.Vector3(4.5, 8.0, 0),    // 3. Upper camber sloping down
        new THREE.Vector3(10.5, 5.8, 0),   // 4. Approaching right nose
        new THREE.Vector3(15.0, 2.2, 0),   // 5. Right rounded nose apex
        new THREE.Vector3(10.8, -1.8, 0),  // 6. Inward slope from nose
        new THREE.Vector3(5.5, -4.8, 0),   // 7. Inner cleft throat
        new THREE.Vector3(2.5, -8.8, 0),   // 8. Sloping down from cleft
        new THREE.Vector3(-0.5, -12.0, 0), // 9. Approaching bottom cusp
        new THREE.Vector3(-3.5, -13.5, 0), // 10. Bottom cusp apex (rounded)
        new THREE.Vector3(-6.8, -5.5, 0),  // 11. Left spine lower
        new THREE.Vector3(-8.8, 2.5, 0)    // 12. Left spine upper
      ];

      const curve = new THREE.CatmullRomCurve3(knots, true, "centripetal");

      for (let i = 0; i < N; i++) {
        const t = i / N;
        const pt = curve.getPoint(t);
        const tan = curve.getTangent(t);

        // Normal in 2D plane: (-Ty, Tx)
        const nx = -tan.y;
        const ny = tan.x;

        // Ribbon thickness: compact, cohesive stream
        const localThick = 0.95 + 0.35 * Math.sin(t * Math.PI * 4);
        const r = (Math.random() + Math.random() - 1.0) * localThick;

        // 4% subtle ambient stardust
        const isDust = Math.random() < 0.04;
        const dust = isDust ? (Math.random() - 0.5) * 2.2 : 0;

        p[i*3]   = pt.x + nx * (r + dust);
        p[i*3+1] = pt.y + ny * (r + dust);
        p[i*3+2] = (Math.random() - 0.5) * 1.4;
      }

      // Exact mathematical centering
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (let i = 0; i < N; i++) {
        const x = p[i*3], y = p[i*3+1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      const midX = (minX + maxX) * 0.5;
      const midY = (minY + maxY) * 0.5;
      for (let i = 0; i < N; i++) {
        p[i*3]   -= midX;
        p[i*3+1] -= midY;
      }

      return p;
    }

    // 4. CLOUD (Domaines) — Widescreen porous star cluster (matching GPT-6 Astra cloud)
    function genCloud(N) {
      const p = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const u1 = Math.max(1e-4, Math.random()), u2 = Math.random();
        const u3 = Math.max(1e-4, Math.random()), u4 = Math.random();
        let x = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2) * 12.5;
        let y = Math.sqrt(-2 * Math.log(u3)) * Math.sin(2 * Math.PI * u4) * 7.0;
        x = Math.max(-24, Math.min(24, x));
        y = Math.max(-13, Math.min(13, y));
        p[i*3] = x;
        p[i*3+1] = y;
        p[i*3+2] = (Math.random() - 0.5) * 4.5;
      }
      return p;
    }

    // 5. ROSETTE (Principes) — Interwoven 5-petal rosette (matching GPT-6 Astra rosette)
    function genRosette(N) {
      const p = new Float32Array(N * 3);
      const arms = 5, ppa = Math.floor(N / arms);
      for (let a = 0; a < arms; a++) {
        const aAngle = (a * 2 * Math.PI) / arms;
        for (let j = 0; j < ppa; j++) {
          const i = a * ppa + j;
          if (i >= N) break;
          const t = j / ppa;
          const r = 2.4 + Math.sin(t * Math.PI) * 12.0;
          const th = aAngle + t * 1.85 * Math.PI;
          const jit = (Math.random() - 0.5) * 0.85;
          p[i*3]   = Math.cos(th) * r * 1.08 + jit;
          p[i*3+1] = Math.sin(th) * r * 0.88 + jit;
          p[i*3+2] = Math.sin(t * Math.PI * 2) * 2.0;
        }
      }
      return p;
    }

    // ── SECTION STAGE FACTORY (FULLSCREEN 100VW × 95VH) ──
    // Creates a self-contained Three.js particle system for each section.
    // Fullscreen canvas, discrete diamond stars, no box feeling, no over-saturation!
    function createStage(canvasId, shapeData, opts = {}) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return null;
      const container = canvas.parentElement;
      if (!container) return null;

      const COUNT = opts.count || 480;
      const camZ = opts.cameraZ || 55;
      const hasCore = opts.hasCore || false;
      const isHero = opts.isHero || false;
      const allowZRotation = opts.allowZRotation || false;

      // 1. Generate target positions for the section's unique celestial shape
      let targetPos;
      let customColors = null;
      const shapeResult = shapeData(COUNT);
      if (shapeResult && shapeResult.positions) {
        targetPos = shapeResult.positions;
        customColors = shapeResult.colors;
      } else {
        targetPos = shapeResult;
      }

      // 2. Dispersed positions across wide widescreen cosmic volume (no box bounding!)
      const dispersed = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        dispersed[i*3]   = (Math.random() - 0.5) * 160;
        dispersed[i*3+1] = (Math.random() - 0.5) * 95;
        dispersed[i*3+2] = (Math.random() - 0.5) * 60;
      }

      // 3. Partition particles into 3 astronomical tiers (matching OpenAI Astra reference):
      // - Tier 1: Radiant Diamond Stars (~8%) with 4-point cross diffraction spikes
      // - Tier 2: Brilliant Pearls (~24%) with soft luminous halos
      // - Tier 3: Standard Celestial Stars (~68%) giving shape structure and high porosity
      const countFlare = Math.max(8, Math.floor(COUNT * 0.08));
      const countPearl = Math.floor(COUNT * 0.24);
      const countBase  = COUNT - countFlare - countPearl;

      // Evenly distribute flare and pearl stars along the shape trajectory
      // so flares appear around the key lobes, clefts, and spines like in the OpenAI reference
      const stepFlare = Math.max(1, Math.floor(COUNT / countFlare));
      const flareIndices = [];
      const pearlIndices = [];
      const baseIndices  = [];

      const used = new Uint8Array(COUNT);
      for (let f = 0; f < countFlare; f++) {
        const idx = Math.min(COUNT - 1, f * stepFlare + Math.floor(Math.random() * 2));
        flareIndices.push(idx);
        used[idx] = 1;
      }

      for (let p = 0; p < COUNT; p++) {
        if (!used[p] && (p % 4 === 0 || p % 5 === 0) && pearlIndices.length < countPearl) {
          pearlIndices.push(p);
          used[p] = 2;
        }
      }
      for (let b = 0; b < COUNT; b++) {
        if (!used[b]) {
          if (pearlIndices.length < countPearl) {
            pearlIndices.push(b);
            used[b] = 2;
          } else {
            baseIndices.push(b);
            used[b] = 3;
          }
        }
      }

      // Unified state buffers
      const pos = new Float32Array(COUNT * 3);
      const vel = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        pos[i*3]   = dispersed[i*3];
        pos[i*3+1] = dispersed[i*3+1];
        pos[i*3+2] = dispersed[i*3+2];
      }

      // Colors for each layer
      function buildColorArray(indices) {
        const arr = new Float32Array(indices.length * 3);
        for (let i = 0; i < indices.length; i++) {
          const idx = indices[i];
          const col = (customColors && customColors[idx]) 
            ? customColors[idx] 
            : palette[Math.floor(Math.random() * palette.length)];
          arr[i*3]   = col.r;
          arr[i*3+1] = col.g;
          arr[i*3+2] = col.b;
        }
        return arr;
      }

      const colFlare = buildColorArray(flareIndices);
      const colPearl = buildColorArray(pearlIndices);
      const colBase  = buildColorArray(baseIndices);

      const posFlare = new Float32Array(flareIndices.length * 3);
      const posPearl = new Float32Array(pearlIndices.length * 3);
      const posBase  = new Float32Array(baseIndices.length * 3);

      function syncSubArrays() {
        for (let i = 0; i < flareIndices.length; i++) {
          const src = flareIndices[i] * 3;
          posFlare[i*3]   = pos[src];
          posFlare[i*3+1] = pos[src+1];
          posFlare[i*3+2] = pos[src+2];
        }
        for (let i = 0; i < pearlIndices.length; i++) {
          const src = pearlIndices[i] * 3;
          posPearl[i*3]   = pos[src];
          posPearl[i*3+1] = pos[src+1];
          posPearl[i*3+2] = pos[src+2];
        }
        for (let i = 0; i < baseIndices.length; i++) {
          const src = baseIndices[i] * 3;
          posBase[i*3]   = pos[src];
          posBase[i*3+1] = pos[src+1];
          posBase[i*3+2] = pos[src+2];
        }
      }
      syncSubArrays();

      // Scene & Fullscreen Camera
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 1000);
      camera.position.z = camZ;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const group = new THREE.Group();
      if (opts.offsetY) group.position.y = opts.offsetY;
      scene.add(group);

      // Layer 1: Base Stars (crisp celestial points)
      const geoBase = new THREE.BufferGeometry();
      geoBase.setAttribute("position", new THREE.BufferAttribute(posBase, 3));
      geoBase.setAttribute("color", new THREE.BufferAttribute(colBase, 3));
      const matBase = new THREE.PointsMaterial({
        size: 2.75,
        map: discTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });
      group.add(new THREE.Points(geoBase, matBase));

      // Layer 2: Pearl Stars (luminous celestial pearls with soft halos)
      const geoPearl = new THREE.BufferGeometry();
      geoPearl.setAttribute("position", new THREE.BufferAttribute(posPearl, 3));
      geoPearl.setAttribute("color", new THREE.BufferAttribute(colPearl, 3));
      const matPearl = new THREE.PointsMaterial({
        size: 4.8,
        map: discTexture,
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });
      group.add(new THREE.Points(geoPearl, matPearl));

      // Layer 3: Radiant Diamond Stars with 4-Point Cross Diffraction Flare
      const geoFlare = new THREE.BufferGeometry();
      geoFlare.setAttribute("position", new THREE.BufferAttribute(posFlare, 3));
      geoFlare.setAttribute("color", new THREE.BufferAttribute(colFlare, 3));
      const matFlare = new THREE.PointsMaterial({
        size: 13.5,
        map: flareTexture,
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });
      group.add(new THREE.Points(geoFlare, matFlare));

      // Optional core glow for hero galaxy
      let coreMesh = null;
      if (hasCore) {
        const cg = new THREE.SphereGeometry(1.1, 16, 16);
        const cm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
        coreMesh = new THREE.Mesh(cg, cm);
        group.add(coreMesh);
      }

      // Assembly state
      let assembly = isHero ? 1.0 : 0.0;
      let targetAssembly = isHero ? 1.0 : 0.0;

      function updateVisibility() {
        if (isHero) {
          const sy = window.scrollY;
          const vh = window.innerHeight;
          if (sy < vh * 1.1) {
            targetAssembly = Math.max(0, Math.min(1, 1 - sy / (vh * 0.75)));
          } else {
            targetAssembly = 0;
          }
          return;
        }

        const rect = container.getBoundingClientRect();
        const vh = window.innerHeight;
        const centerY = rect.top + rect.height * 0.5;
        const distFromCenter = Math.abs(centerY - vh * 0.5);

        const activeRange = vh * 0.85;
        const plateau = vh * 0.35;
        if (distFromCenter <= plateau) {
          targetAssembly = 1.0;
        } else if (distFromCenter < activeRange) {
          const norm = (distFromCenter - plateau) / (activeRange - plateau);
          targetAssembly = Math.pow(Math.cos(norm * Math.PI * 0.5), 1.4);
        } else {
          targetAssembly = 0;
        }
      }
      window.addEventListener("scroll", updateVisibility, { passive: true });
      updateVisibility();

      // Mouse drag rotation
      let drag = false, px = 0, py = 0;
      container.addEventListener("mousedown", e => { drag = true; px = e.clientX; py = e.clientY; });
      window.addEventListener("mouseup", () => drag = false);
      window.addEventListener("mousemove", e => {
        if (drag) {
          group.rotation.y += (e.clientX - px) * 0.006;
          group.rotation.x += (e.clientY - py) * 0.006;
          px = e.clientX; py = e.clientY;
        }
      });

      // Resize
      function handleResize() {
        const rw = container.clientWidth || window.innerWidth;
        const rh = container.clientHeight || window.innerHeight;
        camera.aspect = rw / rh;
        camera.updateProjectionMatrix();
        renderer.setSize(rw, rh);
      }
      window.addEventListener("resize", handleResize);

      // Animation loop
      const clock = new THREE.Clock();
      let frame = 0;

      function animate() {
        requestAnimationFrame(animate);
        frame++;
        if (frame % 4 === 0) updateVisibility();

        const dt = clock.getDelta();
        const t = clock.getElapsedTime();

        assembly += (targetAssembly - assembly) * 0.08;

        // Smooth luminous opacity fade:
        // Assembled -> brilliant crisp stars
        // Dispersing -> cleanly fades to 0.0 (zero residual box border)
        const curOp = Math.max(0, Math.min(1.0, assembly * 1.15));
        matBase.opacity  = curOp * 0.90;
        matPearl.opacity = curOp * 0.95;
        matFlare.opacity = curOp * 1.00;

        if (assembly < 0.002 && targetAssembly === 0) {
          renderer.clear();
          return;
        }

        // Dynamic motion:
        // Galaxy & Rosette rotate slowly around Z
        // Delta Loop and Serif Q stay upright with gentle parallax tilt
        if (!drag) {
          if (allowZRotation) {
            group.rotation.z += 0.04 * dt;
          } else {
            group.rotation.z = 0;
          }
          group.rotation.y = Math.sin(t * 0.35) * 0.07;
          group.rotation.x = Math.cos(t * 0.25) * 0.05;
        }

        const spring = 0.055;
        const damp   = 0.84;

        for (let i = 0; i < COUNT; i++) {
          const idx = i * 3;

          // Living astronomical micro-twinkle & motion
          const motionAmp = 0.18;
          const freq = 0.4 + (i % 7) * 0.08;
          const mx = targetPos[idx]   + Math.sin(t * freq + i * 0.1) * motionAmp;
          const my = targetPos[idx+1] + Math.cos(t * freq * 0.7 + i * 0.2) * motionAmp;
          const mz = targetPos[idx+2] + Math.sin(t * freq * 1.1 + i * 0.3) * motionAmp * 0.6;

          const tx = dispersed[idx]   * (1 - assembly) + mx * assembly;
          const ty = dispersed[idx+1] * (1 - assembly) + my * assembly;
          const tz = dispersed[idx+2] * (1 - assembly) + mz * assembly;

          const fx = (tx - pos[idx])   * spring;
          const fy = (ty - pos[idx+1]) * spring;
          const fz = (tz - pos[idx+2]) * spring;

          vel[idx]   = (vel[idx]   + fx) * damp;
          vel[idx+1] = (vel[idx+1] + fy) * damp;
          vel[idx+2] = (vel[idx+2] + fz) * damp;

          pos[idx]   += vel[idx];
          pos[idx+1] += vel[idx+1];
          pos[idx+2] += vel[idx+2];
        }

        syncSubArrays();
        geoBase.attributes.position.needsUpdate  = true;
        geoPearl.attributes.position.needsUpdate = true;
        geoFlare.attributes.position.needsUpdate = true;

        if (coreMesh) {
          coreMesh.material.opacity = 0.85 * assembly;
          const s = (1 + Math.sin(t * 3) * 0.15) * assembly;
          coreMesh.scale.set(s, s, s);
        }

        renderer.render(scene, camera);
      }
      animate();
    }

    // ── CREATE ALL FULLSCREEN SECTION STAGES (CALIBRATED ACCURACY) ──
    createStage("hero-galaxy-canvas", genGalaxy, { count: 750, cameraZ: 66, offsetY: -12.5, hasCore: true, isHero: true, allowZRotation: true });
    createStage("manifesto-q-canvas", genQ, { count: 650, cameraZ: 55, allowZRotation: false });
    createStage("benchmarks-cursor-canvas", genDeltaLoop, { count: 480, cameraZ: 55, allowZRotation: false });
    createStage("domains-cloud-canvas", genCloud, { count: 520, cameraZ: 55, allowZRotation: false });
    createStage("principles-rosette-canvas", genRosette, { count: 550, cameraZ: 55, allowZRotation: true });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. INTERACTIVE BENCHMARKS
  // ═══════════════════════════════════════════════════════════════════════════
  const benchmarkData = {
    resilience: {
      title: "Disponibilité & Résilience Système (Offline-First)",
      legendQuantis: "QUANTIS Architecture Souveraine",
      legendTier1: "Solutions Cloud Classiques (AWS/Azure)",
      yAxisLabel: "Taux de Disponibilité Effective (%)",
      xAxisLabel: "Durée de Rupture Réseau Externe (Heures)",
      pointsQuantis: [
        { x: 50, y: 35, val: "99.999%" }, { x: 180, y: 38, val: "99.99%" },
        { x: 310, y: 40, val: "99.98%" }, { x: 440, y: 42, val: "99.95%" },
        { x: 580, y: 45, val: "99.9%" }
      ],
      pointsTier1: [
        { x: 50, y: 60, val: "98.2%" }, { x: 180, y: 110, val: "92.5%" },
        { x: 310, y: 180, val: "81.0%" }, { x: 440, y: 240, val: "68.4%" },
        { x: 580, y: 280, val: "42.0%" }
      ],
      caption: "Grâce à son moteur de synchronisation décentralisé Offline-First et ses unités physiques Edge, QUANTIS maintient 99.9% de disponibilité opérationnelle même lors de coupures Internet prolongées."
    },
    latency: {
      title: "Latence & Débit Réseau Zero-Trust (Quantis 001)",
      legendQuantis: "QUANTIS Network 001 (Hardware)",
      legendTier1: "Pare-feux Industriels Fortinet / Cisco",
      yAxisLabel: "Débit Garanti sans Perte (Gbps)",
      xAxisLabel: "Nombre de Connexions Simultanées (k)",
      pointsQuantis: [
        { x: 50, y: 40, val: "98.4 Gbps" }, { x: 180, y: 45, val: "97.8 Gbps" },
        { x: 310, y: 50, val: "97.1 Gbps" }, { x: 440, y: 55, val: "96.5 Gbps" },
        { x: 580, y: 60, val: "95.9 Gbps" }
      ],
      pointsTier1: [
        { x: 50, y: 90, val: "85 Gbps" }, { x: 180, y: 140, val: "72 Gbps" },
        { x: 310, y: 200, val: "58 Gbps" }, { x: 440, y: 245, val: "42 Gbps" },
        { x: 580, y: 270, val: "30 Gbps" }
      ],
      caption: "Mesures en banc d'essai certifié Fluke & Ixia : L'architecture Zero-Trust Quantis assure une latence sub-milliseconde sous charge maximale."
    },
    automation: {
      title: "Efficacité Opérationnelle & Réduction d'Erreurs (Jarvis)",
      legendQuantis: "QUANTIS Jarvis Core + ERP",
      legendTier1: "ERP Traditionnels Configurés",
      yAxisLabel: "Taux de Tâches Automatisées avec Succès (%)",
      xAxisLabel: "Complexité du Workflow d'Entreprise (Paliers)",
      pointsQuantis: [
        { x: 50, y: 30, val: "98%" }, { x: 180, y: 40, val: "95%" },
        { x: 310, y: 55, val: "93%" }, { x: 440, y: 70, val: "90%" },
        { x: 580, y: 85, val: "88%" }
      ],
      pointsTier1: [
        { x: 50, y: 110, val: "74%" }, { x: 180, y: 160, val: "59%" },
        { x: 310, y: 210, val: "46%" }, { x: 440, y: 250, val: "35%" },
        { x: 580, y: 280, val: "22%" }
      ],
      caption: "Audit de performance sur 10 000 opérations de caisse et de stocks : Les agents conversationnels Jarvis éliminent 94% des saisies manuelles redondantes."
    },
    durability: {
      title: "Index de Pérennité Logicielle & Dette Technique (10+ Ans)",
      legendQuantis: "Codebase Souveraine QUANTIS",
      legendTier1: "Frameworks d'Entreprise Lourds",
      yAxisLabel: "Score d'Intégrité Architecturale (Sur 100)",
      xAxisLabel: "Années d'Exploitation Continue",
      pointsQuantis: [
        { x: 50, y: 30, val: "99/100" }, { x: 180, y: 32, val: "98/100" },
        { x: 310, y: 35, val: "97/100" }, { x: 440, y: 38, val: "96/100" },
        { x: 580, y: 42, val: "95/100" }
      ],
      pointsTier1: [
        { x: 50, y: 80, val: "86/100" }, { x: 180, y: 120, val: "74/100" },
        { x: 310, y: 180, val: "58/100" }, { x: 440, y: 230, val: "42/100" },
        { x: 580, y: 270, val: "28/100" }
      ],
      caption: "Principe 6 : Chaque ligne de code est écrite pour durer au moins dix ans. Zéro dépendance instable, audits de sécurité continus."
    }
  };

  const benchmarkTabs = document.querySelectorAll(".benchmark-tab");
  const benchmarkTitle = document.getElementById("benchmarkTitle");
  const benchmarkCaption = document.getElementById("benchmarkCaption");
  const pathQuantis = document.getElementById("pathQuantis");
  const pathTier1 = document.getElementById("pathTier1");
  const pointsContainer = document.getElementById("benchmarkPoints");
  const yAxisTitle = document.getElementById("yAxisTitle");
  const xAxisTitle = document.getElementById("xAxisTitle");

  function renderBenchmark(key) {
    const data = benchmarkData[key];
    if (!data) return;
    if (benchmarkTitle) benchmarkTitle.textContent = data.title;
    if (benchmarkCaption) benchmarkCaption.textContent = data.caption;
    if (yAxisTitle) yAxisTitle.textContent = data.yAxisLabel;
    if (xAxisTitle) xAxisTitle.textContent = data.xAxisLabel;
    const dQ = data.pointsQuantis.reduce((a, pt, i) => `${a} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
    const dT = data.pointsTier1.reduce((a, pt, i) => `${a} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
    if (pathQuantis) pathQuantis.setAttribute("d", dQ);
    if (pathTier1) pathTier1.setAttribute("d", dT);
    if (pointsContainer) {
      pointsContainer.innerHTML = '';
      data.pointsQuantis.forEach(pt => {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); c.setAttribute("r", 5);
        c.setAttribute("fill", "#38bdf8"); c.setAttribute("stroke", "#fff"); c.setAttribute("stroke-width", "2");
        c.style.cursor = "pointer"; c.innerHTML = `<title>QUANTIS: ${pt.val}</title>`;
        pointsContainer.appendChild(c);
      });
      data.pointsTier1.forEach(pt => {
        const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        r.setAttribute("x", pt.x - 4); r.setAttribute("y", pt.y - 4);
        r.setAttribute("width", 8); r.setAttribute("height", 8);
        r.setAttribute("fill", "#c5a059"); r.style.cursor = "pointer";
        r.innerHTML = `<title>Concurrent: ${pt.val}</title>`;
        pointsContainer.appendChild(r);
      });
    }
  }

  benchmarkTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      benchmarkTabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderBenchmark(btn.getAttribute("data-bench"));
    });
  });
  renderBenchmark("resilience");

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. DOMAINS SHOWCASE
  // ═══════════════════════════════════════════════════════════════════════════
  const domainData = {
    mobile: { category: "INGÉNIERIE MOBILE", badge: "● OFFLINE-FIRST & NATIVE", title: "Applications Mobiles Haute Performance", desc: "Conçues pour fonctionner parfaitement même sans réseau Internet. Synchronisation delta haute fréquence, chiffrement local biométrique, et intégration transparente des terminaux d'encaissement et de scan code-barres.", img: "img_service_mobile.jpg", specs: [{ val: "< 16ms", label: "Temps de rendu par trame (60 FPS fluide)" }, { val: "100%", label: "Fonctionnalités opérationnelles hors-ligne" }], tags: ["Flutter", "React Native", "Local SQLite Chiffré", "Biométrie", "iOS & Android"] },
    desktop: { category: "LOGICIELS MÉTIERS", badge: "● ERP & WORKSTATION", title: "Systèmes Desktop & Postes d'Opérations", desc: "Logiciels d'entreprise robustes pour Windows, macOS et Linux. Gestion intégrale de chaîne logistique, point de vente (POS) ultra-réactif, comptabilité et tableaux de bord analytiques temps réel.", img: "img_service_desktop.jpg", specs: [{ val: "< 0.3s", label: "Génération de facture & ticket de caisse" }, { val: "Multi-OS", label: "Exécution native multiplateforme" }], tags: ["Electron", ".NET Core", "Spring Boot", "Multi-Tenant", "Gestion de Caisse"] },
    web: { category: "PLATEFORMES WEB & SAAS", badge: "● PWA & CLOUD NATIVE", title: "Portails Web & Solutions SaaS Résilientes", desc: "Applications web progressives à très haute disponibilité. Architectures microservices scalables, interfaces réactives à l'extrême, optimisation SEO et sécurité applicative de niveau bancaire.", img: "img_service_web.jpg", specs: [{ val: "100/100", label: "Score Google Lighthouse Performance & SEO" }, { val: "Zero-Trust", label: "Chiffrement TLS 1.3 de bout en bout" }], tags: ["React", "Next.js", "Spring Boot", "PWA", "PostgreSQL", "Docker"] },
    network: { category: "INFRASTRUCTURES SOUVERAINES", badge: "● ZERO-TRUST & ROUTAGE 100G", title: "Infrastructures Réseau & Matériels Souverains", desc: "Conception, sécurisation et déploiement d'architectures réseau critiques. Routage dynamique, segmentation Zero-Trust, pare-feux nouvelle génération et monitoring proactif 24h/24.", img: "img_service_network.jpg", specs: [{ val: "< 0.8ms", label: "Latence interne sur cœur de réseau" }, { val: "24/7", label: "Supervision temps réel et alerte automatique" }], tags: ["Cisco & Fortinet", "VLAN / SD-WAN", "Châssis Quantis 001", "Fibre Optique"] },
    cabling: { category: "GÉNIE PHYSIQUE & CÂBLAGE", badge: "● CERTIFICATION FLUKE", title: "Câblage Structuré & Réseaux Fibre Optique", desc: "Déploiement physique dans les règles de l'art : baies de brassage ordonnées au millimètre, câblage cuivre Cat6A blindé, soudures optiques haute précision et certification officielle aux normes TIA/EIA.", img: "img_service_cabling.jpg", specs: [{ val: "100%", label: "Liaisons certifiées par réflectométrie Fluke" }, { val: "25 Ans", label: "Garantie de pérennité de l'infrastructure" }], tags: ["Fibre Monomode/Multimode", "Cat6A F/UTP", "Baies de Brassage", "Normes TIA/EIA"] },
    ai: { category: "INTELLIGENCE ARTIFICIELLE", badge: "● JARVIS CORE AGENTIC AI", title: "IA Conversationnelle & Assistants Autonomes", desc: "Jarvis Core : le cerveau autonome d'entreprise. Analyse prédictive des réapprovisionnements, reconnaissance vocale naturelle multilingue, et automatisation des décisions complexes sans intervention humaine.", img: "img_service_ai.jpg", specs: [{ val: "94%", label: "Tâches de décision courantes automatisées" }, { val: "Local First", label: "Traitement Edge préservant la souveraineté" }], tags: ["Agentic AI", "NLP & Speech-to-Text", "Analyse Prédictive", "Jarvis Core", "Edge ML"] }
  };

  const domainTabs = document.querySelectorAll(".domain-tab");
  const domainCat = document.getElementById("domainCat");
  const domainBadge = document.getElementById("domainBadge");
  const domainTitle = document.getElementById("domainTitle");
  const domainDesc = document.getElementById("domainDesc");
  const domainImg = document.getElementById("domainImg");
  const domainSpecs = document.getElementById("domainSpecs");
  const domainTags = document.getElementById("domainTags");

  function renderDomain(key) {
    const item = domainData[key];
    if (!item) return;
    if (domainCat) domainCat.textContent = item.category;
    if (domainBadge) domainBadge.textContent = item.badge;
    if (domainTitle) domainTitle.textContent = item.title;
    if (domainDesc) domainDesc.textContent = item.desc;
    if (domainImg) {
      domainImg.style.opacity = "0";
      setTimeout(() => { domainImg.src = item.img; domainImg.alt = item.title; domainImg.style.opacity = "1"; }, 150);
    }
    if (domainSpecs) {
      domainSpecs.innerHTML = item.specs.map(s => `<div class="domain-spec-box"><div class="domain-spec-val">${s.val}</div><div class="domain-spec-label">${s.label}</div></div>`).join('');
    }
    if (domainTags) {
      domainTags.innerHTML = item.tags.map(t => `<span class="domain-tag-item">${t}</span>`).join('');
    }
  }

  domainTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      domainTabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderDomain(btn.getAttribute("data-domain"));
    });
  });
  renderDomain("mobile");

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. CONTACT FORM
  // ═══════════════════════════════════════════════════════════════════════════
  const contactForm = document.getElementById("contactForm");
  const btnSubmit = document.getElementById("btnSubmit");
  if (contactForm && btnSubmit) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const orig = btnSubmit.innerHTML;
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = "Transmission en cours...";
      setTimeout(() => {
        btnSubmit.style.background = "#059669"; btnSubmit.style.color = "#fff";
        btnSubmit.innerHTML = "✓ Message Transmis avec Succès à QUANTIS";
        contactForm.reset();
        setTimeout(() => { btnSubmit.style.background = ""; btnSubmit.style.color = ""; btnSubmit.innerHTML = orig; btnSubmit.disabled = false; }, 4000);
      }, 1000);
    });
  }
});
