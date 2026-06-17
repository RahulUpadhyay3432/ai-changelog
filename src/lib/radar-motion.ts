import type { Variants } from "framer-motion";

// Restrained motion for the Radar (calm-intelligence brand): Premium/Calm —
// no bounce, no overshoot, no loud/fast content motion. Signature easing
// cubic-bezier(0.4, 0, 0.2, 1). See the motion-design + micro-interactions vet.

export const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
export const EASE_EXIT: [number, number, number, number] = [0.3, 0, 1, 1];
export const DUR = { quick: 0.14, standard: 0.32, slow: 0.48 } as const;

// Spring for the active lens-pill indicator — critically damped, zero bounce.
export const lensIndicatorSpring = { type: "spring" as const, stiffness: 320, damping: 34 };

// Variant set, reduced-motion aware. `reduced` → opacity-only crossfades, no
// transforms, no stagger.
export function radarVariants(reduced: boolean) {
  const block: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduced
        ? { duration: DUR.quick }
        : { staggerChildren: 0.05, delayChildren: 0.04, when: "beforeChildren" },
    },
    exit: { opacity: 0, transition: { duration: 0.18, ease: EASE_EXIT } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 12 },
    show: { opacity: 1, y: 0, transition: { duration: DUR.standard, ease: EASE } },
  };
  const hero: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.985 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: DUR.slow, ease: EASE } },
  };
  return { block, item, hero };
}
