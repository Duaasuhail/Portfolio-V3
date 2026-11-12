"use client";

import { useEffect, useRef } from "react";

const SPARKLES = 14;

type Mode = "default" | "link" | "view" | "explore" | "press";

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  scale: number;
}

function Star({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 1h2v5h1v1h5v2h-5v1H9v5H7v-5H6V9H1V7h5V6h1V1z"
      />
    </svg>
  );
}

function getElement(node: EventTarget | null): Element | null {
  if (node instanceof Element) return node;
  if (node instanceof Node) return node.parentElement;
  return null;
}

function resolveTarget(node: EventTarget | null): { mode: Mode; el: HTMLElement | null } {
  const el = getElement(node);
  if (!el) return { mode: "default", el: null };

  const view = el.closest<HTMLElement>("[data-cursor='view']");
  if (view) return { mode: "view", el: view };

  const press = el.closest<HTMLElement>("button, [role='button']");
  if (press) return { mode: "press", el: press };

  const link = el.closest<HTMLElement>("a[href]");
  if (link) {
    const external = link.getAttribute("target") === "_blank";
    return { mode: external ? "explore" : "link", el: link };
  }

  return { mode: "default", el: null };
}

export default function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const star = root.querySelector<HTMLElement>("[data-cursor-star]");
    const starShadow = root.querySelector<HTMLElement>("[data-cursor-star-shadow]");
    const ring = root.querySelector<HTMLElement>("[data-cursor-ring]");
    const pill = root.querySelector<HTMLElement>("[data-cursor-pill]");
    const pillShadow = root.querySelector<HTMLElement>("[data-cursor-pill-shadow]");
    const frame = root.querySelector<HTMLElement>("[data-cursor-frame]");
    const dots = Array.from(root.querySelectorAll<HTMLElement>("[data-cursor-dot]"));
    if (!star || !starShadow || !ring || !pill || !pillShadow || !frame) return;

    const mouse = { x: -100, y: -100, inside: false };
    const pos = { x: -100, y: -100 };
    const pool: Sparkle[] = dots.map(() => ({
      x: -100,
      y: -100,
      vx: 0,
      vy: 0,
      life: 0,
      decay: 0.04,
      scale: 1,
    }));
    const box = { x: 0, y: 0, w: 0, h: 0, o: 0 };
    let cursorIdx = 0;
    let distAccum = 0;
    let mode: Mode = "default";
    let target: HTMLElement | null = null;
    let label = "";
    let starScale = 1;
    let ringScale = 0;
    let pillScale = 0.85;
    let pillOpacity = 0;
    let raf = 0;
    let primed = false;
    let motion = !reduced.matches;
    let allow = fine.matches;

    const customOn = () => document.documentElement.classList.contains("has-custom-cursor");

    const spawnSparkle = (x: number, y: number, speed: number) => {
      if (!motion || dots.length === 0) return;
      const p = pool[cursorIdx];
      cursorIdx = (cursorIdx + 1) % pool.length;

      const angle = Math.random() * Math.PI * 2;
      const drift = 0.25 + Math.min(1.4, speed * 0.04) * Math.random();
      const spread = 4 + Math.random() * 6;

      p.x = x + Math.cos(angle) * spread;
      p.y = y + Math.sin(angle) * spread;
      p.vx = Math.cos(angle) * drift;
      p.vy = Math.sin(angle) * drift - 0.15;
      p.life = 1;
      p.decay = 0.032 + Math.random() * 0.025;
      p.scale = Math.random() > 0.35 ? 1 : 0.75;
    };

    const showCustom = (on: boolean) => {
      const enabled = on && allow;
      document.documentElement.classList.toggle("has-custom-cursor", enabled);
      root.dataset.active = enabled && mouse.inside ? "true" : "false";
      if (!enabled && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const setEnabled = () => {
      allow = fine.matches;
      motion = !reduced.matches;
      if (!allow) showCustom(false);
    };

    const place = (el: HTMLElement, x: number, y: number, scale = 1, opacity?: number) => {
      el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%, -50%) scale(${scale})`;
      if (opacity !== undefined) el.style.opacity = String(opacity);
    };

    const syncLabel = (next: Mode) => {
      const text = next === "view" ? "VIEW" : next === "explore" ? "EXPLORE" : "";
      if (text === label) return;
      label = text;
      pill.textContent = text;
      if (!text) return;
      pillShadow.style.width = `${pill.offsetWidth}px`;
      pillShadow.style.height = `${pill.offsetHeight}px`;
    };

    const applyTarget = (node: EventTarget | null) => {
      const next = resolveTarget(node);
      if (next.mode === mode && next.el === target) return;
      mode = next.mode;
      target = next.el;
      root.dataset.state = mode;
      syncLabel(mode);
    };

    const tick = () => {
      const twinkle = p.life > 0.2 && p.life < 0.8 ? (Math.sin(p.life * 26) > 0 ? 1 : 0.7) : 1;
const opacity = Math.min(1, p.life * 1.6) * twinkle * (showPill ? 0.45 : 1);
      if (!customOn() || !mouse.inside) {
        raf = 0;
        return;
      }

      let tx = mouse.x;
      let ty = mouse.y;
      if ((mode === "view" || mode === "explore") && target && target.isConnected) {
        const rect = target.getBoundingClientRect();
        const dx = rect.left + rect.width / 2 - mouse.x;
        const dy = rect.top + rect.height / 2 - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(6, dist * 0.05);
        tx += (dx / dist) * pull;
        ty += (dy / dist) * pull;
      }

      const follow = motion ? (mode === "press" ? 0.45 : 0.38) : 1;
      pos.x += (tx - pos.x) * follow;
      pos.y += (ty - pos.y) * follow;

      const showPill = mode === "view" || mode === "explore";
      const targetStarScale = showPill ? 0.2 : mode === "press" ? 1.25 : mode === "link" ? 1.15 : 1;
      const targetRingScale = mode === "link" ? 1 : 0;
      const targetPillScale = showPill ? 1 : 0.85;
      const targetPillOpacity = showPill ? 1 : 0;

      const ease = motion ? 0.24 : 1;
      starScale += (targetStarScale - starScale) * ease;
      ringScale += (targetRingScale - ringScale) * ease;
      pillScale += (targetPillScale - pillScale) * ease;
      pillOpacity += (targetPillOpacity - pillOpacity) * ease;

      const starOpacity = showPill ? Math.max(0, 1 - pillOpacity) : 1;
      place(starShadow, pos.x, pos.y, starScale * 1.22, starOpacity);
      place(star, pos.x, pos.y, starScale, starOpacity);
      place(ring, pos.x, pos.y, 0.5 + ringScale * 0.5, ringScale);
      place(pillShadow, pos.x + 2, pos.y + 2, pillScale, pillOpacity);
      place(pill, pos.x, pos.y, pillScale, pillOpacity);

      const snap = motion ? 0.3 : 1;
      let targetBox = { x: pos.x, y: pos.y, w: 12, h: 12, o: 0 };
      if (mode === "press" && target && target.isConnected) {
        const rect = target.getBoundingClientRect();
        targetBox = { x: rect.left, y: rect.top, w: rect.width, h: rect.height, o: 1 };
      }

      box.x += (targetBox.x - box.x) * snap;
      box.y += (targetBox.y - box.y) * snap;
      box.w += (targetBox.w - box.w) * snap;
      box.h += (targetBox.h - box.h) * snap;
      box.o += (targetBox.o - box.o) * snap;

      frame.style.transform = `translate3d(${Math.round(box.x)}px, ${Math.round(box.y)}px, 0)`;
      frame.style.width = `${Math.max(0, Math.round(box.w))}px`;
      frame.style.height = `${Math.max(0, Math.round(box.h))}px`;
      frame.style.opacity = String(Math.max(0, box.o));

      let activeSparkles = 0;
      for (let i = 0; i < dots.length; i++) {
        const p = pool[i];
        if (p.life <= 0) {
          dots[i].style.opacity = "0";
          continue;
        }
        activeSparkles++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life = Math.max(0, p.life - p.decay);

        const twinkle = p.life > 0.25 && p.life < 0.75 ? (Math.sin(p.life * 28) > 0 ? 1 : 0.45) : 1;
        const opacity = p.life * twinkle * (showPill ? 0.35 : 0.95);
        const s = p.scale * (0.6 + p.life * 0.4);

        dots[i].style.transform = `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0) translate(-50%, -50%) scale(${s.toFixed(2)})`;
        dots[i].style.opacity = opacity.toFixed(2);
      }

      const settled =
        activeSparkles === 0 &&
        Math.abs(tx - pos.x) < 0.05 &&
        Math.abs(ty - pos.y) < 0.05 &&
        Math.abs(targetStarScale - starScale) < 0.005 &&
        Math.abs(targetRingScale - ringScale) < 0.005 &&
        Math.abs(targetPillOpacity - pillOpacity) < 0.005 &&
        Math.abs(targetBox.o - box.o) < 0.005;

      if (settled) {
        raf = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    const startLoop = () => {
      if (customOn() && mouse.inside && !raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (event: PointerEvent) => {
      if (!allow) return;
      const prevX = mouse.x;
      const prevY = mouse.y;
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.inside = true;

      if (!primed) {
        primed = true;
        pos.x = mouse.x;
        pos.y = mouse.y;
        box.x = mouse.x;
        box.y = mouse.y;
      } else {
        const dist = Math.hypot(mouse.x - prevX, mouse.y - prevY);
        distAccum += dist;
        if (distAccum >= 12) {
          const count = dist > 40 ? 2 : 1;
          for (let n = 0; n < count; n++) {
            spawnSparkle(mouse.x, mouse.y, dist);
          }
          distAccum = 0;
        }
      }

      showCustom(true);
      applyTarget(event.target);
      startLoop();
    };

    const onScroll = () => {
      if (!mouse.inside || !allow) return;
      applyTarget(document.elementFromPoint(mouse.x, mouse.y));
      startLoop();
    };

    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      mouse.inside = false;
      showCustom(false);
    };

    setEnabled();
    fine.addEventListener("change", setEnabled);
    reduced.addEventListener("change", setEnabled);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
      fine.removeEventListener("change", setEnabled);
      reduced.removeEventListener("change", setEnabled);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="cursor-layer" data-state="default" data-active="false" aria-hidden="true">
      {Array.from({ length: SPARKLES }, (_, index) => (
        <span
          key={index}
          data-cursor-dot
          className={index % 2 === 0 ? "cursor-dot cursor-dot--star" : "cursor-dot cursor-dot--pixel"}
        />
      ))}
      <span data-cursor-frame className="cursor-frame" />
      <span data-cursor-ring className="cursor-ring" />
      <span data-cursor-pill-shadow className="cursor-pill-shadow" />
      <span data-cursor-pill className="cursor-pill" />
      <span data-cursor-star-shadow className="cursor-star cursor-star--shadow">
        <Star className="cursor-star-svg" />
      </span>
      <span data-cursor-star className="cursor-star">
        <Star className="cursor-star-svg" />
      </span>
    </div>
  );
}