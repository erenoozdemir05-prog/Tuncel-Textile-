import { useEffect, useRef, useState } from "react";

/**
 * useReveal — Intersection Observer driven scroll reveal.
 * Returns a ref to attach to an element. When the element enters the viewport,
 * sets a state to true (one-shot). Pair with the `.lx-reveal` / `.is-visible` CSS classes.
 *
 * Usage:
 *   const { ref, visible } = useReveal();
 *   <section ref={ref} className={`lx-reveal ${visible ? "is-visible" : ""}`} />
 */
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      // SSR / very old browsers — show immediately
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px", ...options },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [options]);

  return { ref, visible };
}
