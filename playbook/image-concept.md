# Step: visual concept for the hero image

You are choosing the single subject for the post's hero photograph. The prompt you
write goes to an image model, followed by a fixed treatment block that sets the
light, palette and framing. Your subject has to carry the image. The treatment only
unifies it with the rest of the blog.

## Input

- `post.json`: the final post.
- `used-subjects.json`: subjects already used by other Kapyn heroes. Do not reuse a
  subject, and do not reuse its main material or its setting.

## The rule, learned the hard way

The first batch of Kapyn heroes came back as near-identical circuit boards. The
subjects were abstract ("two mirrored structures facing each other"), there was
nothing real to photograph, and the model fell back on generic tech imagery. The
next attempt produced glowing neon brains with words written across them.

So the subject must be a **real, physical, photographable object or small scene**,
with named materials, that a photographer could set up on a table. It works as a
visual metaphor for the post's core idea.

Good subjects, each tied to its post:
- Model comparison: "A brass balance scale on dark slate, its two shallow pans
  holding different small objects, one pan resting slightly lower than the other."
- Running models locally: "An open desktop computer case lying on a workbench, a
  single large graphics card seated inside, dust and cable ties visible."
- A new protocol spec: "A folded engineering blueprint on a drafting table, revision
  marks in red pencil, an eraser and a scale rule beside it."

## Never

- Screens, UIs, code, charts, logos, robots, brains, glowing networks, circuit
  boards, holograms, "AI" imagery of any kind.
- Anything with text, letters, numbers or signage (book spines, labels, keyboards
  with legends, clocks with numerals, newspapers).
- People, hands or faces.
- Abstract compositions, illustration, vector art, 3D renders.

## Output

Return only the structured output described by the schema:
- `subject`: one sentence, 15-35 words, the object first, then its materials and
  arrangement. No lighting, palette or style words; the treatment covers those.
- `metaphor`: one sentence on how the object relates to the post.
- `alt`: alt text of under 120 characters describing what the photo literally shows.
- `materials`: the 1-3 main materials (for the reuse check).
- `setting`: the surface or place, in 1-3 words (for the reuse check).
