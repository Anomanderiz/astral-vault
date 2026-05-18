# Magic Item Vault -- Claude Code Build Spec

A 3D animated rolodex of D&D magic item cards, floating in a twinkling starfield void.  
Stack: **React + Vite · Supabase · Vercel**

---

## 1. Project Bootstrap

```bash
npm create vite@latest magic-item-vault -- --template react
cd magic-item-vault
npm install
npm install @supabase/supabase-js
npm install @fontsource/cinzel @fontsource/crimson-pro
```

Create `.env.local` at project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create `vercel.json` at project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## 2. Supabase Schema

Run the following SQL in the Supabase SQL editor to create the table:

```sql
create table magic_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  player text not null,
  character text,
  rarity text not null check (rarity in ('common','uncommon','rare','very rare','legendary','artifact')),
  item_type text not null,
  requires_attunement boolean default false,
  attunement_condition text,
  description text not null,
  flavour_text text,
  properties jsonb default '[]',
  created_at timestamptz default now()
);

alter table magic_items enable row level security;

create policy "Public read" on magic_items for select using (true);
```

### Seed data -- the three existing custom items

Run this after creating the table:

```sql
insert into magic_items (name, player, character, rarity, item_type, requires_attunement, attunement_condition, description, flavour_text, properties) values
(
  'Vestments of the Twilight Warden',
  'Vil',
  'Kira',
  'rare',
  'Wondrous Item (Vestments)',
  true,
  'by a Cleric or Paladin who worships a deity of twilight or stars',
  'These deep violet robes are woven with silver thread that traces the outlines of constellations, each one shifting slowly across the fabric as if alive. While attuned, you gain the following benefits:\n\n**Twilight Sanctuary (Recharge 5–6).** As a bonus action, you emanate an aura of dim twilight light in a 30-foot radius until the end of your next turn. Creatures of your choice in the aura gain temporary hit points equal to your spellcasting modifier + your proficiency bonus.\n\n**Starward Step.** Once per long rest, when you take damage that would reduce you to 0 hit points, you instead drop to 1 hit point and teleport up to 30 feet to an unoccupied space you can see. Until the start of your next turn, you are invisible.\n\n**Veil of the In-Between.** You have advantage on saving throws against effects that would magically transport you against your will.',
  'The constellations never quite map to any sky anyone can name.',
  '[{"name": "Twilight Sanctuary", "recharge": "5-6"}, {"name": "Starward Step", "recharge": "long rest"}, {"name": "Veil of the In-Between", "passive": true}]'
),
(
  'Flameweave Spear',
  'Vil',
  'Paladin/Warlock',
  'very rare',
  'Weapon (Spear)',
  true,
  'by a Paladin or Warlock',
  'This spear''s haft is wrapped in crimson cord branded with the symbol of the Red Knight, its tip trailing a faint heat-shimmer even in cold air. It functions as a +2 spear.\n\n**Strategic Smite.** Once per turn when you hit a creature with this spear, you can expend a spell slot to deal an additional 2d8 fire damage per level of the slot expended (instead of the normal Divine Smite damage type, which becomes fire).\n\n**Battle Calculus.** As a reaction when a creature within 30 feet of you makes an attack roll, you can impose disadvantage on that roll as you intuit the angle of the strike. You may use this feature a number of times equal to your Charisma modifier (minimum 1), regaining all uses on a long rest.\n\n**Red Knight''s Gambit (1/Day).** As a bonus action, you designate a target you can see. Until the start of your next turn, all attacks against that target by allies who can see you have a +2 bonus to hit.',
  'The Red Knight teaches that victory is a proof, not a prayer.',
  '[{"name": "+2 Weapon", "passive": true}, {"name": "Strategic Smite", "passive": true}, {"name": "Battle Calculus", "recharge": "Cha mod per long rest"}, {"name": "Red Knight''s Gambit", "recharge": "1/day"}]'
),
(
  'Spellhunter''s Monocle',
  'Vil',
  'Wizard',
  'rare',
  'Wondrous Item (Eyewear)',
  true,
  'by a spellcaster',
  'A brass monocle etched with concentric detection sigils, the lens tinted a faint gold. It hums almost imperceptibly when magic is nearby.\n\n**Arcane Sight.** While wearing this monocle, you can see the faint auras of active magical effects and enchanted objects within 60 feet, as the spell *detect magic*, without concentration.\n\n**Spell Signature.** When a creature within 60 feet casts a spell, you can use your reaction to attempt to identify it (no roll required if it is a spell on your class spell list; otherwise Intelligence (Arcana) DC 12 + spell level). If you identify the spell, you have advantage on your next saving throw against it.\n\n**Counter-Thread (3/Day).** When you successfully counterspell a spell, you may immediately regain a spell slot of a level equal to half the countered spell''s level (rounded down, minimum 1st).',
  'Knowledge of the mechanism is the first step toward its undoing.',
  '[{"name": "Arcane Sight", "passive": true}, {"name": "Spell Signature", "recharge": "reaction"}, {"name": "Counter-Thread", "recharge": "3/day"}]'
);
```

---

## 3. File Structure

```
magic-item-vault/
├── public/
├── src/
│   ├── components/
│   │   ├── StarField.jsx        -- canvas starfield background
│   │   ├── Rolodex.jsx          -- 3D carousel controller
│   │   ├── ItemCard.jsx         -- individual card (front + back flip)
│   │   ├── PlayerFilter.jsx     -- filter pill buttons
│   │   └── RarityBadge.jsx      -- colour-coded rarity chip
│   ├── lib/
│   │   └── supabase.js          -- supabase client init
│   ├── hooks/
│   │   └── useItems.js          -- data fetching hook
│   ├── styles/
│   │   └── globals.css          -- CSS variables, resets, fonts
│   ├── App.jsx
│   └── main.jsx
├── .env.local
├── vercel.json
└── vite.config.js
```

---

## 4. Visual Design Specification

### Aesthetic direction
Dark arcane luxury. Deep space void with living constellations behind polished grimoire-style item cards. Think: illuminated manuscript meets orrery. Not generic "fantasy purple" -- commit to near-black indigo-to-void gradients with gold and silver filigree accents.

### Typography
- **Display / card titles**: `Cinzel` (small-caps serif, weight 700) -- imported from `@fontsource/cinzel`
- **Body / descriptions**: `Crimson Pro` (oldstyle serif, weight 400/600) -- imported from `@fontsource/crimson-pro`

### CSS Variables (define in `globals.css`)

```css
:root {
  --void:        #05040f;
  --void-mid:    #0d0b1e;
  --indigo-deep: #1a1740;
  --gold:        #c9a84c;
  --gold-light:  #f0d080;
  --silver:      #b8c4d4;
  --parchment:   #f2e8d0;
  --parchment-dark: #d4c49a;

  /* Rarity colours */
  --rarity-common:    #aaaaaa;
  --rarity-uncommon:  #2dc46e;
  --rarity-rare:      #4a90d9;
  --rarity-very-rare: #9b59b6;
  --rarity-legendary: #e67e22;
  --rarity-artifact:  #e74c3c;

  --card-w: 280px;
  --card-h: 420px;
  --card-radius: 12px;
}
```

### Starfield (`StarField.jsx`)
- Full-viewport `<canvas>` as a fixed background layer
- Two star layers: 120 small dim stars + 40 brighter stars, all white with randomised opacity
- Twinkling: each star has an independent sine-wave opacity animation driven by `requestAnimationFrame`
- Subtle slow drift: stars move at 0.02--0.05 px/frame horizontally, wrapping at canvas edge
- Occasional shooting star: random interval 4--12 s, a single line drawn with a fading trail

### Card design (`ItemCard.jsx`)
Each card has a **front face** and a **back face** (CSS 3D flip on click).

**Front face layout (top to bottom):**
1. Header band -- card name in Cinzel, centred, gold text on dark indigo band. A fine gold border frames the card.
2. Type line -- `item_type` · `Requires Attunement` if applicable -- Crimson Pro italic, silver, smaller
3. Rarity badge -- pill with rarity colour background
4. Divider -- a thin gold SVG line with a diamond ornament in the centre
5. Property chips -- one small pill per entry in `properties` array, dark background, gold text, listing just the property name
6. Owner tag at the base -- `[character] · [player]` in small silver Cinzel

**Back face layout:**
1. Full `description` text in Crimson Pro, comfortable padding, parchment background
2. If `flavour_text` present: italic parchment-coloured text below a thin divider at the bottom
3. A "flip back" affordance (small ↩ icon, top-right corner)

**Card border glow:** 1--2px solid border in the rarity colour, with a subtle `box-shadow` outer glow matching the rarity colour at low opacity.

**Flip mechanic:**
- CSS `transform-style: preserve-3d` on the card wrapper
- Front: `rotateY(0deg)`, Back: `rotateY(180deg)`
- On click, toggle a `.flipped` class that rotates the wrapper to `rotateY(180deg)`
- Transition: `transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)`

---

## 5. Rolodex Carousel (`Rolodex.jsx`)

### Geometry
Arrange cards in a **cylindrical carousel** around the Y axis:

```js
// For N visible cards:
const angle = (2 * Math.PI) / N;          // angular separation
const radius = (cardWidth + gap) / (2 * Math.tan(angle / 2));

// Position card i:
const theta = i * angle + rotationOffset;
card.style.transform = `
  rotateY(${theta}rad)
  translateZ(${radius}px)
`;
```

The cylinder rotates -- not the cards individually. Wrap all cards in a single `.carousel-inner` div with `transform-style: preserve-3d` and animate its `rotateY`.

### Navigation
- **Arrow buttons** (left/right, positioned outside the carousel) each advance by one card step (`2π / N` radians)
- **Drag/swipe**: mouse `mousedown` + `mousemove` delta drives the rotation in real time; release snaps to nearest card position with a spring-ease CSS transition
- **Keyboard**: `←` `→` arrow keys advance one step
- Transition on snap: `transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)`

### Card perspective
Apply on the outermost `.carousel-scene` wrapper:
```css
.carousel-scene {
  perspective: 1200px;
  perspective-origin: 50% 45%;
}
```

### Active card highlighting
The frontmost card (closest to viewer) gets a subtle scale-up: `scale(1.06)` and full opacity. Cards at ±1 positions get `opacity: 0.75`, further cards get `opacity: 0.45`. Apply these per-card based on angular distance from 0.

---

## 6. Player Filter (`PlayerFilter.jsx`)

- Derive the player list dynamically from the fetched items array: `[...new Set(items.map(i => i.player))]`
- Render one pill button per player, plus an "All" pill
- Active filter pill: gold border + gold text; inactive: silver text, dim border
- Filtering updates the items array passed to `Rolodex`, which then recalculates carousel geometry for the new N
- When the filter changes, briefly animate the carousel cards out (opacity 0, scale 0.95) then back in (opacity 1, scale 1) over 200ms to signal the refresh

Layout: horizontally centred row of pills, positioned above the carousel. Use `gap: 8px`, pill padding `6px 16px`, `border-radius: 20px`.

---

## 7. Data Fetching (`useItems.js`)

```js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from('magic_items')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error);
        else setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  return { items, loading, error };
}
```

---

## 8. App Layout (`App.jsx`)

```
<div class="app">
  <StarField />                  -- fixed canvas, z-index 0
  <div class="ui-layer">        -- z-index 1, flex column centred
    <header>
      <h1>The Vault</h1>        -- Cinzel, gold, large, subtle letter-spacing
      <p>Artefacts of Power</p> -- Crimson Pro italic, silver, smaller
    </header>
    <PlayerFilter />
    {loading ? <LoadingState /> : <Rolodex items={filteredItems} />}
  </div>
</div>
```

The loading state can be a simple animated constellation of dots in gold, no spinner.

---

## 9. Responsive Behaviour

- Below 768px: reduce `--card-w` to 220px and `--card-h` to 340px; reduce visible carousel cards to 3
- Carousel arrow buttons move below the carousel on mobile into a row of `← ·  →` nav
- Starfield canvas stays full viewport at all sizes

---

## 10. Vercel Deployment

1. Push the project to GitHub.
2. In Vercel, import the GitHub repo.
3. Framework preset: **Vite**.
4. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Subsequent pushes to `main` auto-deploy.

No server-side functions are needed -- this is a pure static SPA reading from Supabase directly.

---

## 11. Implementation Order for Claude Code

Execute in this sequence to minimise backtracking:

1. Bootstrap Vite project and install dependencies
2. Create `globals.css` with all CSS variables and font imports
3. Create `supabase.js` client
4. Implement `useItems.js` hook
5. Build `StarField.jsx` with twinkling + drift + shooting stars
6. Build `RarityBadge.jsx`
7. Build `ItemCard.jsx` (front + back, flip mechanic)
8. Build `Rolodex.jsx` (carousel geometry, drag, keyboard, snap)
9. Build `PlayerFilter.jsx`
10. Wire up `App.jsx`
11. Run the Supabase SQL (schema + seed) in the Supabase dashboard
12. Test locally with `npm run dev` -- verify cards load, carousel spins, filter works, flip works
13. Configure `.env.local`, commit, push to GitHub, deploy to Vercel

---

## 12. Notes and Edge Cases

- **Single item**: if only one item passes the filter, show it centred without carousel controls
- **Zero items**: show a short flavour message in Crimson Pro italic, gold, centred -- "The Vault stirs... but holds no artefacts matching this search."
- **Description markdown**: the `description` field uses `**bold**` for ability names. Render this with a lightweight markdown parser (`marked` or `react-markdown`, whichever is smaller) rather than raw text
- **Long descriptions**: the back-face card should scroll internally (`overflow-y: auto`, styled scrollbar matching the parchment colour) rather than growing infinitely
- **`properties` array**: this is JSONB containing objects with `{name, recharge?, passive?}`. Render only the `name` on the front-face chips
- The `player` field in seed data is set to `'Vil'` for all three items as a placeholder -- update directly in Supabase to the actual player names (Kira's player, Paladin's player, Wizard's player) before first use
