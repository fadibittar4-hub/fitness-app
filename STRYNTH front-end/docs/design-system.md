# STRYNTH Design System

The STRYNTH frontend uses SCSS source tokens that compile into global CSS custom properties. This gives you two layers:

- SCSS variables for authoring and extending the design system
- CSS variables for runtime component styling and theming

## Token Source

Primary token file:

- [src/styles/abstracts/_variables.scss](c:/Users/User1/STRYNTH/src/styles/abstracts/_variables.scss)

Theme layer:

- [src/styles/themes/_dark-neon.scss](c:/Users/User1/STRYNTH/src/styles/themes/_dark-neon.scss)

## Token Categories

### Background colors

- `--color-bg`: app background
- `--color-bg-alt`: secondary background zone
- `--color-bg-elevated`: elevated page background

### Surface and card colors

- `--color-surface`: default card and section surface
- `--color-surface-strong`: denser elevated surface

### Neon green primary

- `--color-primary`: main brand accent
- `--color-primary-strong`: stronger highlight for active states
- `--color-primary-soft`: soft accent wash for subtle fills
- `--color-primary-glow`: atmospheric glow color for backgrounds and focus rings

### Text colors

- `--color-text-primary`: primary body text
- `--color-text-secondary`: secondary labels and supporting text
- `--color-text-muted`: low-emphasis metadata
- `--color-text-inverse`: text on neon or bright surfaces

### Border colors

- `--color-border`: default border
- `--color-border-strong`: stronger separators
- `--color-border-accent`: highlighted accent border

### Spacing scale

- `--space-1` to `--space-8`

Use the scale consistently:

- `--space-2` to `--space-3`: compact controls
- `--space-4`: default component padding
- `--space-5` to `--space-6`: section spacing
- `--space-7` to `--space-8`: large page rhythm

### Radius values

- `--radius-sm`: small badges and chips
- `--radius-md`: buttons and compact inputs
- `--radius-lg`: standard panels
- `--radius-xl`: cards and shell containers
- `--radius-2xl`: hero or large feature surfaces
- `--radius-pill`: pill controls and nav actions

### Shadows

- `--shadow-sm`: standard surface elevation
- `--shadow-md`: stronger panel elevation
- `--shadow-lg`: hero-level elevation
- `--shadow-glow`: subtle neon highlight
- `--shadow-glow-strong`: stronger brand glow for marks and active UI

### Typography sizes

- `--text-xs`
- `--text-sm`
- `--text-md`
- `--text-lg`
- `--text-xl`
- `--text-2xl`

Font families:

- `--font-display`: headings and brand moments
- `--font-body`: UI and body copy
- `--font-mono`: numeric or technical values

## Component Usage Rules

Components should use semantic tokens, not raw hex values or arbitrary spacing.

Preferred patterns:

```scss
.trainer-card {
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.trainer-card__title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  color: var(--color-text-primary);
}

.trainer-card__meta {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.trainer-card--active {
  border-color: var(--color-border-accent);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}
```

For interactive components:

```scss
.primary-button {
  min-height: 3rem;
  padding-inline: var(--space-4);
  border-radius: var(--radius-pill);
  background: linear-gradient(135deg, var(--color-primary-strong), var(--color-primary));
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-glow-strong);
}
```

For themed `<select>` elements (always override browser defaults):

```scss
select.your-input {
  appearance: none;
  background-color: var(--color-surface-strong);
  background-image: url("data:image/svg+xml,..."); // custom chevron SVG using --color-text-muted tint
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  padding-right: var(--space-7);
  color-scheme: dark;

  option {
    background-color: var(--color-surface-strong);
    color: var(--color-text-primary);
  }
}
```

## Consistency Rules

- Use `var(--color-surface)` for cards instead of inventing new grays.
- Use the spacing scale instead of fixed pixel gaps.
- Use typography tokens for all text sizing.
- Use accent borders and glow only for active, focused, or premium emphasis states.
- Keep component-level SCSS semantic and avoid hardcoded brand values in feature files.

## Shared UI Components

All reusable components live in `src/app/shared/components/ui/`. Use these before creating new ones.

| Selector | Component | Notes |
|---|---|---|
| `ui-button` | `ButtonComponent` | Variants: `primary` \| `secondary`. No click output — use native `(click)`. |
| `ui-badge` | `BadgeComponent` | Status/label badge |
| `ui-chip` | `ChipComponent` | Filter chip |
| `ui-rating-stars` | `RatingStarsComponent` | Star rating display |
| `ui-search-bar` | `SearchBarComponent` | Search input with icon |
| `ui-section-title` | `SectionTitleComponent` | Section heading block |
| `ui-trainer-card` | `TrainerCardComponent` | Trainer summary card |
| `ui-session-bookers` | `SessionBookersComponent` | Toggle button + bookers list for a session. Inputs: `bookers: Booking[]`, `expanded: boolean`. Output: `toggle` (EventEmitter, no payload). |

## Responsive Breakpoints

The app uses a single mobile-first breakpoint:

- **Mobile** (default): `< 48rem` (768px) — bottom tab navigation, stacked layouts, compact spacing
- **Desktop**: `≥ 48rem` — sidebar navigation, multi-column grids, expanded spacing

Key layout variables:

- `--bottom-nav-height: 3.5rem` — set as padding-bottom on page content to avoid overlap on mobile
- `--top-nav-height: 3.5rem` — reserved for sticky topbars

Apply desktop overrides inside a `@media (min-width: 48rem)` block at the end of each component SCSS file.

## Theming

The app ships with a single dark neon theme. Theme overrides are applied in:

- `src/styles/themes/_dark-neon.scss`

The theme file re-declares CSS custom properties on `:root` to override the base token values. To add a new theme, create a new file under `styles/themes/` and conditionally apply it via a class or media query.