# Blog hero image prompts

## What went wrong the first time, and the rule that follows

Version one produced near-identical circuit-board schematics from different
prompts. The cause was a balance error, and it is worth stating plainly so the
same mistake does not get rebuilt:

- The **style block was ~150 words of concrete visual instruction**. The
  **subject lines were ~15 words of abstract geometry**. A model weights the
  long concrete part and discards the short vague part.
- "Two mirrored line-structures facing each other" is not a subject. It is a
  description of a composition, and there is no such object to photograph. With
  nothing real to render, every generation fell back on the only concrete thing
  in the prompt: *flat vector, thin strokes, technical schematic, instrument
  panel*. That phrase resolves to PCB traces essentially every time.

**The rule now: the subject carries the image, the treatment only unifies it.**

- Every subject below is a **real, physical, photographable thing** with named
  materials. Two subjects cannot collapse into each other because a pegboard of
  hand tools and a darkroom enlarger are not the same object.
- The treatment block describes **light, palette, framing and mood only**. It
  never says what things look like. It is short on purpose so the subject wins.
- Subject goes **first** in the prompt. Early tokens carry more weight.

The images already on the blog that work, network cables patched into a switch,
modular components on a workbench, hand tools on a pegboard, are all real
photographs of real objects. That is the target.

## Two hard constraints from the page CSS

- **No text, letters, numbers or logos.** `blog.module.css` overlays the post
  title, tag and deck on the hero. Anything written in the image collides.
- **The lower-left third must fall away to near-black.** That is exactly where
  the title sits under the gradient scrim.

Hero is 380px tall on desktop, 280 on mobile, `object-fit: cover`. Generate
**1600x900** or the nearest 16:9 the tool offers.

---

## TREATMENT — paste this AFTER the subject

```
Photographed as an editorial still life. Wide 16:9 frame.

Low-key lighting from a single soft source at the upper right, falling away
into deep shadow toward the lower left. Warm near-black background, #0c0b0a.
Muted desaturated colour throughout with one restrained cool-blue note.
Shallow depth of field, 50mm, honest texture, visible material grain, real
wear. Quiet and considered, not dramatic.

The lower-left third of the frame must be near-empty and in shadow.

No text, letters, numbers, logos or watermarks. No people. No illustration,
no vector art, no schematic line-work, no 3D render, no neon, no lens flare.
```

Prompt format is: `<subject sentence>` then a blank line, then the treatment.

---

## TEST THREE FIRST

Do not generate 59 of anything again until three come back visibly different
from one another. These three are chosen because they share no material,
no scale and no setting. If they still look alike, the approach is wrong again
and we change it before you spend more time.

| Post | Subject |
|---|---|
| `claude-vs-gpt-which-to-use` | A brass balance scale on dark slate, its two shallow pans holding different small objects, one pan resting slightly lower than the other. |
| `run-llms-locally-2026` | An open desktop computer case lying on a workbench, a single large graphics card seated inside, dust and cable ties visible. |
| `best-ai-tools-for-content-creators-2026` | A large studio condenser microphone on a boom arm with a mesh pop filter just in front of it. |

---

## ALL 59 SUBJECTS

### Comparisons
| Post | Subject |
|---|---|
| `claude-vs-gpt-which-to-use` | A brass balance scale on dark slate, its two shallow pans holding different small objects, one pan resting slightly lower than the other. |
| `claude-vs-gemini-which-to-use-2026` | Two fountain pens of clearly different design, one steel and one lacquered, lying crossed on dark grained leather. |
| `best-ai-chatbots-2026` | Four vintage desk telephones lined up on a dark table, each from a different decade, handsets resting in their cradles. |
| `gpt-6-astra-what-changed` | A disassembled brass telescope eyepiece on dark felt, lens elements laid out in order beside the barrel. |

### Explainers
| Post | Subject |
|---|---|
| `what-is-mcp-model-context-protocol` | A single coiled telephone switchboard patch cord with worn brass tips, resting on dark oiled wood. |
| `what-is-agentic-ai-2026` | The exposed brass movement of a clockwork orrery, gear teeth meshed, mainspring visible. |
| `agent-plugins-1-0-explained` | An open machinist's case with fitted foam cut-outs, three precision instruments seated exactly in their recesses and one recess empty. |

### Roundups
| Post | Subject |
|---|---|
| `ai-tooling-august-2026` | A row of wooden-handled date stamps standing on a dark desk beside a well-used ink pad. |
| `ai-tooling-september-2026` | A 35mm contact sheet lying on a lightbox, strips of frames slightly overlapping, a loupe resting on one corner. |

### The MCP cluster
| Post | Subject |
|---|---|
| `best-mcp-servers-2026` | A steel pegboard wall with exactly six well-worn hand tools hung on it and many empty hooks around them. |
| `best-mcp-servers-for-claude-2026` | A vintage telephone operator's switchboard with a small handful of cords patched across a field of unused jacks. |
| `mcp-2026-07-28-spec-what-changed` | A folded engineering blueprint on a drafting table, revision marks in red pencil, an eraser and a scale rule beside it. |

### Tool guides
| Post | Subject |
|---|---|
| `ai-stack-for-indie-hackers-2026` | A worn leather tool roll unrolled on a bench, holding a deliberately small set of tools with empty loops between them. |
| `tools-every-vibe-coder-should-know` | A letterpress compositor's type case with metal sorts in their compartments, a few lifted out and resting on the frame. |
| `best-ai-tech-stack-for-any-product-2026` | A cutaway architectural section model on a dark table, its floor plates stacked and visibly separated. |
| `best-ai-coding-assistants-2026` | A mechanical keyboard with several keycaps lifted off and set aside, bare switches exposed beneath. |
| `best-ai-tools-for-designers-2026` | Paper colour swatch fans opened and overlapping on a dark surface, with loose printed chips scattered across them. |
| `best-ai-tools-for-startups-2026` | A brass sextant resting on a folded nautical chart, dividers and a pencil alongside. |
| `best-ai-writing-tools-2026` | The carriage of a manual typewriter in close-up, a sheet of paper threaded through the platen. |
| `best-ai-tools-for-productivity-2026` | A row of analogue mechanical kitchen timers of different sizes standing on a dark shelf. |
| `best-free-ai-tools-2026` | A glass honesty jar half-filled with coins on a wooden counter, lid off and set beside it. |
| `best-ai-video-generators-2026` | A 16mm film reel with a length of film unspooled across a lightbox, sprocket holes catching the light. |
| `best-ai-image-generators-2026` | A darkroom enlarger head above an empty easel, developing trays waiting in the foreground shadow. |
| `best-ai-tools-for-seo-2026` | A library card catalogue drawer pulled fully open, cards fanned upright inside it. |
| `best-ai-tools-for-data-analysis-2026` | A slide rule lying across a scattered stack of punched cards on dark felt. |
| `best-ai-tools-for-email-2026` | A wooden pigeonhole letter rack, most slots stuffed with envelopes, a few empty. |
| `best-ai-tools-for-research-2026` | A bundle of index cards tied with string beside a brass reading lamp casting a tight pool of light. |
| `best-ai-tools-for-project-management-2026` | A steel planning board covered in small magnetic tiles arranged in staggered rows. |
| `best-ai-tools-for-content-creators-2026` | A large studio condenser microphone on a boom arm with a mesh pop filter just in front of it. |
| `best-ai-tools-for-customer-support-2026` | A hotel front-desk call bell on a marble counter, a rack of room keys on hooks behind it. |
| `best-ai-tools-2026` | A sparse shelf holding four well-worn objects with wide gaps between them, everything else bare. |
| `best-ai-skills-2026` | A set of machinist's precision gauge blocks stacked in a short tower on a steel surface. |
| `best-ai-agents-2026` | The exposed brass mechanism of a clockwork automaton, linkages and cams visible through an open back panel. |
| `best-ai-tools-for-developers-2026` | An electronics workbench with an oscilloscope screen dark, a breadboard part-wired, and a soldering iron in its stand. |
| `best-ai-tools-for-marketing-2026` | A dented brass megaphone lying on its side on a dark painted floor. |
| `best-ai-tools-for-social-media-2026` | A grid of small instant-photo frames pinned to a dark corkboard, a few hanging slightly crooked. |
| `best-ai-tools-for-education-2026` | A wooden schoolroom abacus with beads pushed to one side, worn chalk nubs resting beside it. |

### Process guides
| Post | Subject |
|---|---|
| `vibe-coding-explained-2026` | A half-thrown clay vessel on a potter's wheel, wet and asymmetric, trimmings scattered around the wheel head. |
| `vibe-coding-design-checklist` | A drafting table with a T-square and set square laid over a sheet ruled in precise pencil lines. |
| `vibe-coding-security-checklist-2026` | A heavy steel door with the deadbolt thrown but the security chain hanging loose and unlatched. |
| `run-llms-locally-2026` | An open desktop computer case lying on a workbench, a single large graphics card seated inside, dust and cable ties visible. |
| `control-ai-credit-burn-2026` | A brass gas meter with its dials in close-up, the housing scratched and the glass slightly clouded. |
| `ai-for-legal-2026` | A stack of leather-bound legal volumes with cloth ribbon markers trailing from between the pages. |
| `ai-for-healthcare-2026` | A stethoscope coiled on a stainless steel tray beside a monitor with a blank, unlit screen. |

### Opinion
| Post | Subject |
|---|---|
| `why-ai-tool-directories-are-useless` | An overstuffed card catalogue with several drawers hanging open, identical cards spilling from them. |
| `is-your-ai-wrapper-defensible-2026` | An empty glass and brass museum vitrine standing open on a dark floor, its velvet plinth bare. |
| `distribution-specificity-problem-2026` | A watering can spraying a wide scatter of droplets beside a single glass pipette releasing one precise drop. |
| `is-it-too-late-to-learn-ai-2026` | A weathered wooden trail marker at the head of a long empty path, early morning light, the route stretching away. |
| `ai-tool-graveyard-2026` | A dusty stack of obsolete storage media, floppy disks, MiniDiscs and Zip cartridges, piled unevenly in a crate. |

### India series
See the caveat below before generating any of these.

| Post | Subject |
|---|---|
| `india-ai-startup-ecosystem-2026` | Stacks of Indian rupee coins of uneven height on a dark stone surface, three stacks far taller than the rest. |
| `indiaai-mission-explained-2026` | A government office rubber stamp resting on an open ledger beside a well-used purple ink pad. |
| `sovereign-ai-india-2026` | A server rack seen through the mesh of its closed door, status lights small and dim in a darkened room. |
| `best-ai-tools-for-indian-startups-2026` | A cutting-chai glass on a saucer beside a laptop on a crowded desk, condensation on the glass. |
| `ai-startups-in-bengaluru-2026` | Keep the existing photograph. |
| `ai-startups-in-delhi-ncr-2026` | Keep the existing photograph. |
| `ai-startups-in-mumbai-2026` | Keep the existing photograph. |
| `ai-startups-in-hyderabad-2026` | Keep the existing photograph. |
| `ai-startups-in-pune-2026` | Keep the existing photograph. |
| `ai-startups-in-chennai-2026` | Keep the existing photograph. |

**The caveat.** The six city posts already carry real Creative Commons
photographs of those actual cities, added in PR #53. A generated still life of a
chai glass cannot beat a real photograph of Bengaluru for a post about
Bengaluru. Leave them. The four India pillar posts above are more abstract and
are fair game.

---

## Workflow

1. Generate 16:9, ideally 1600x900. Anything near that ratio is fine, the CSS
   crops to the centre.
2. Name the file exactly `<slug>.webp`, the left column above, and put it in
   `public/blog/`. WebP at quality ~80.
3. Send me a batch. I will point `hero.src` at it, drop the now-unneeded
   `credit` field, and stamp `updated`.

Partial batches are fine. Any post without a generated image keeps its current
photograph.

## If two still come out similar

Say which two. The fix is almost always that their subjects share a material or
a setting, and the answer is to change one subject rather than to add more words
to the treatment. Adding words to the treatment is what caused the first
failure.
