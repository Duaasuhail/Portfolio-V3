"use client";

import { useEffect, useRef } from "react";
import { FOOTER_SKY_VH, SKY_HEIGHT_VH } from "./GalaxyBackground";

const TRAIL = 7;

type Mode = "default" | "link" | "view" | "explore" | "press";

function Star({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 1.1 19.15 12.85 30.9 16 19.15 19.15 16 30.9 12.85 19.15 1.1 16 12.85 12.85 Z"
      />
    </svg>
  );
}

function galaxyHost(node: EventTarget | null): HTMLElement | null {
  const el = node instanceof Element ? node : null;
  return el?.closest<HTMLElement>(".hero, .site-footer") ?? null;
}

/** Matches the constellation pen zone in GalaxyBackground. Links keep the custom cursor. */
function inGalaxy(clientY: number, node: EventTarget | null): HTMLElement | null {
  const el = node instanceof Element ? node : null;
  if (!el || el.closest("a[href], button, [role='button'], [data-cursor='view']")) return null;

  const hero = el.closest<HTMLElement>(".hero");
  if (hero) {
    const y = clientY - hero.getBoundingClientRect().top;
    return y <= window.innerHeight * SKY_HEIGHT_VH * 0.85 ? hero : null;
  }

  const footer = el.closest<HTMLElement>(".site-footer");
  if (footer) {
    const y = clientY - footer.getBoundingClientRect().top;
    return y >= window.innerHeight * FOOTER_SKY_VH * 0.25 ? footer : null;
  }

  return null;
}

function resolveTarget(node: EventTarget | null): { mode: Mode; el: HTMLElement | null } {
  const el = node instanceof Element ? node : null;
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
    const dots = [...root.querySelectorAll<HTMLElement>("[data-cursor-dot]")];
    if (!star || !starShadow || !ring || !pill || !pillShadow || !frame) return;

    const mouse = { x: -100, y: -100, inside: false };
    const pos = { x: -100, y: -100 };
    const trail = dots.map(() => ({ x: -100, y: -100 }));
    const box = { x: 0, y: 0, w: 0, h: 0, o: 0 };
    let mode: Mode = "default";
    let target: HTMLElement | null = null;
    let label = "";
    let starScale = 1;
    let ringScale = 0;
    let pillScale = 0.72;
    let pillOpacity = 0;
    let raf = 0;
    let primed = false;
    let motion = !reduced.matches;

    let allow = fine.matches;
    let galaxyEl: HTMLElement | null = null;

    const customOn = () => document.documentElement.classList.contains("has-custom-cursor");

    const setGalaxyCursor = (host: HTMLElement | null, active: boolean) => {
      if (galaxyEl && galaxyEl !== host) galaxyEl.style.cursor = "";
      galaxyEl = host;
      if (!host) return;
      const next = active ? "crosshair" : "";
      if (host.style.cursor !== next) host.style.cursor = next;
    };

    const showCustom = (on: boolean) => {
      document.documentElement.classList.toggle("has-custom-cursor", on && allow);
      root.dataset.active = on && allow && mouse.inside ? "true" : "false";
      if (!on && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const setEnabled = () => {
      allow = fine.matches;
      motion = !reduced.matches;
      if (!allow) {
        showCustom(false);
        setGalaxyCursor(galaxyEl, false);
      }
    };

    const place = (el: HTMLElement, x: number, y: number, scale = 1, opacity?: number) => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      if (opacity != null) el.style.opacity = String(opacity);
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
      if (!customOn() || !mouse.inside) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);

      let tx = mouse.x;
      let ty = mouse.y;
      if ((mode === "view" || mode === "explore") && target) {
        const rect = target.getBoundingClientRect();
        const dx = rect.left + rect.width / 2 - mouse.x;
        const dy = rect.top + rect.height / 2 - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(10, dist * 0.08);
        tx += (dx / dist) * pull;
        ty += (dy / dist) * pull;
      }

      const follow = motion ? (mode === "press" ? 0.42 : 0.34) : 1;
      pos.x += (tx - pos.x) * follow;
      pos.y += (ty - pos.y) * follow;

      const showPill = mode === "view" || mode === "explore";
      const ease = motion ? 0.22 : 1;
      starScale += ((showPill ? 0.2 : mode === "press" ? 1.5 : mode === "link" ? 1.28 : 1) - starScale) * ease;
      ringScale += ((mode === "link" ? 1 : 0) - ringScale) * ease;
      pillScale += ((showPill ? 1 : 0.72) - pillScale) * ease;
      pillOpacity += ((showPill ? 1 : 0) - pillOpacity) * ease;

      const starOpacity = showPill ? Math.max(0, 1 - pillOpacity) : 1;
      place(starShadow, pos.x + 2, pos.y + 3, starScale, starOpacity);
      place(star, pos.x, pos.y, starScale, starOpacity);
      place(ring, pos.x, pos.y, 0.35 + ringScale * 0.65, ringScale);
      place(pillShadow, pos.x + 3, pos.y + 3, pillScale, pillOpacity);
      place(pill, pos.x, pos.y, pillScale, pillOpacity);

      const snap = motion ? 0.28 : 1;
      if (mode === "press" && target) {
        const rect = target.getBoundingClientRect();
        box.x += (rect.left - box.x) * snap;
        box.y += (rect.top - box.y) * snap;
        box.w += (rect.width - box.w) * snap;
        box.h += (rect.height - box.h) * snap;
        box.o += (1 - box.o) * snap;
      } else {
        box.x += (pos.x - box.x) * snap;
        box.y += (pos.y - box.y) * snap;
        box.w += (18 - box.w) * snap;
        box.h += (18 - box.h) * snap;
        box.o += (0 - box.o) * snap;
      }
      frame.style.transform = `translate3d(${box.x}px, ${box.y}px, 0)`;
      frame.style.width = `${Math.max(0, box.w)}px`;
      frame.style.height = `${Math.max(0, box.h)}px`;
      frame.style.opacity = String(Math.max(0, box.o));

      let px = pos.x;
      let py = pos.y;
      for (let i = 0; i < dots.length; i++) {
        const point = trail[i];
        const ease = 0.38 - i * 0.035;
        point.x += (px - point.x) * ease;
        point.y += (py - point.y) * ease;
        const fade = motion ? (1 - i / dots.length) * (showPill ? 0.35 : 0.8) : 0;
        dots[i].style.transform = `translate3d(${Math.round(point.x)}px, ${Math.round(point.y)}px, 0) translate(-50%, -50%)`;
        dots[i].style.opacity = String(fade);
        px = point.x;
        py = point.y;
      }
    };

    const syncZone = (node: EventTarget | null) => {
      const host = inGalaxy(mouse.y, node);
      if (host) {
        showCustom(false);
        setGalaxyCursor(host, true);
        return;
      }
      setGalaxyCursor(galaxyHost(node), false);
      showCustom(true);
      applyTarget(node);
    };

    const onMove = (event: PointerEvent) => {
      if (!allow) return;
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.inside = true;
      if (!primed) {
        primed = true;
        pos.x = mouse.x;
        pos.y = mouse.y;
        box.x = mouse.x;
        box.y = mouse.y;
        for (const point of trail) {
          point.x = mouse.x;
          point.y = mouse.y;
        }
      }
      syncZone(event.target);
      if (customOn() && !raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!mouse.inside || !allow) return;
      syncZone(document.elementFromPoint(mouse.x, mouse.y));
      if (customOn() && !raf) raf = requestAnimationFrame(tick);
    };

    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      mouse.inside = false;
      showCustom(false);
      setGalaxyCursor(null, false);
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
      {Array.from({ length: TRAIL }, (_, index) => (
        <span
          key={index}
          data-cursor-dot
          className={index < 2 ? "cursor-dot cursor-dot--star" : "cursor-dot cursor-dot--pixel"}
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
