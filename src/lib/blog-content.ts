// ─── Kapyn blog — hand-authored seed content ─────────────────────────────────
// The blog engine (Phase 2) will generate posts into a `blog_posts` table; until
// then these are hand-written seed posts. The (web)/blog routes read from here,
// so swapping the data source later is a drop-in change. Calm voice, sources
// cited, no hype — same rules as the rest of Kapyn.

export interface BlogTool {
  name: string;
  valueLine: string;
  url: string;
}

export interface BlogSection {
  heading: string;
  intro: string;
  tools: BlogTool[];
}

export interface BlogPost {
  slug: string;
  title: string;
  deck: string;
  /** ISO date */
  date: string;
  readingMin: number;
  tag: string;
  intro: string[];
  sections: BlogSection[];
  closing: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "tools-every-vibe-coder-should-know",
    title: "Tools every vibe coder should know",
    deck:
      "A working set of free front-end tools — the well-known and the deliberately niche — for shipping interfaces that don't look like a template.",
    date: "2026-06-21",
    readingMin: 6,
    tag: "Guide",
    intro: [
      "The gap between a project that looks like a template and one that looks considered is rarely the framework. It's the small, often niche tools a builder reaches for — a component you didn't have to design, a background that took a minute instead of an afternoon, a typeface nobody else is using yet.",
      "Here's a working set, from the names most people already know to the deliberately niche. Everything here is free and copy-paste friendly, and every one lives on the Radar — so you can save the ones that fit into a Loadout and find them again.",
    ],
    sections: [
      {
        heading: "Components you copy and ship",
        intro:
          "Why hand-build a pricing section or an animated hero when someone has already designed, animated, and accessibility-checked it? These libraries hand you whole blocks — copy the code, own it, move on.",
        tools: [
          { name: "Magic UI", valueLine: "Animated React and Tailwind components for landing pages.", url: "https://magicui.design" },
          { name: "Cult UI", valueLine: "Copy-paste animated React and shadcn components and blocks.", url: "https://cult-ui.com" },
          { name: "Motion Primitives", valueLine: "Animation-first React components built on Framer Motion.", url: "https://motion-primitives.com" },
          { name: "Watermelon UI", valueLine: "React components built on Tailwind, Radix, and Framer Motion.", url: "https://ui.watermelon.sh" },
          { name: "Componentry", valueLine: "Animated React components built with Tailwind and Framer Motion.", url: "https://componentry.fun" },
          { name: "Uiverse", valueLine: "Thousands of free CSS and Tailwind UI elements to copy.", url: "https://uiverse.io" },
        ],
      },
      {
        heading: "Icons and type that kill the template look",
        intro:
          "Two of the fastest ways a project stops looking generic: one consistent icon set instead of a mix of three, and a typeface most people haven't seen yet.",
        tools: [
          { name: "Phosphor Icons", valueLine: "Open-source icon family in six weights, including duotone.", url: "https://phosphoricons.com" },
          { name: "Fontshare", valueLine: "Free professional-grade fonts from the Indian Type Foundry.", url: "https://fontshare.com" },
        ],
      },
      {
        heading: "Motion, without the wiring",
        intro:
          "Movement is what makes an interface feel alive — but writing keyframes and transition logic by hand is a tax. These two remove it.",
        tools: [
          { name: "Animista", valueLine: "Preview, tune, and copy ready-made CSS keyframe animations.", url: "https://animista.net" },
          { name: "AutoAnimate", valueLine: "Add smooth enter, leave, and move transitions in one line.", url: "https://auto-animate.formkit.com" },
        ],
      },
      {
        heading: "Backgrounds that feel expensive",
        intro:
          "A flat background reads as unfinished; a considered one reads as premium. Generate it in a minute, export, and drop it in.",
        tools: [
          { name: "Shader Gradient", valueLine: "Configure animated WebGL gradient backgrounds and export them.", url: "https://shadergradient.co" },
          { name: "Mesh Gradient", valueLine: "Create warped shader mesh gradients to export as backgrounds.", url: "https://meshgradient.com" },
          { name: "Haikei", valueLine: "Generate SVG wave, blob, and gradient backgrounds to export.", url: "https://haikei.app" },
          { name: "Pattern Monster", valueLine: "Customize repeatable SVG patterns, then copy the CSS or SVG.", url: "https://pattern.monster" },
        ],
      },
    ],
    closing:
      "None of this is about adding more — it's about reaching for the right small tool at the right moment. Save the ones that fit into a Loadout on the Radar, and they'll be there the next time you're staring at a blank section.",
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Flat list of every tool across a post's sections — for index teasers / chips. */
export function postTools(post: BlogPost): BlogTool[] {
  return post.sections.flatMap((s) => s.tools);
}
