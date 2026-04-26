# 🎨 Design System — Interior Execution Platform

## 1. Philosophy

This product is a **trust-first platform** combining:

* Financial reliability (escrow, payments)
* Design experience (AI interiors)
* Execution control (BOQ, milestones)

### Core Principles

* **Clarity over decoration**
* **Trust over trend**
* **Consistency over creativity**
* **Calm over noise**

---

## 2. Design Language

### Style

* Glassmorphism + Neumorphism hybrid
* Soft depth, subtle elevation
* Minimal, premium, Apple/Stripe-inspired

### Visual Tone

* Calm, professional, high-end
* No bright/neon colors
* No harsh shadows

---

## 3. Color System

### 🌞 Light Theme (Ivory Trust)

```css
--bg-primary:      #FAFAF9;
--bg-surface:      #FFFFFF;
--bg-elevated:     #F4F4F5;

--text-primary:    #18181B;
--text-secondary:  #52525B;
--text-muted:      #71717A;

--accent-primary:  #6366F1;
--accent-soft:     #818CF8;

--success:         #22C55E;
--warning:         #F59E0B;
--error:           #EF4444;

--border-default:  #E4E4E7;
--border-soft:     #F1F5F9;

--glass:           rgba(0,0,0,0.03);
```

---

### 🌙 Dark Theme (Obsidian Trust)

```css
--bg-primary:      #0D0D0D;
--bg-surface:      #161616;
--bg-elevated:     #1F1F1F;

--text-primary:    #F5F5F5;
--text-secondary:  #A1A1AA;
--text-muted:      #71717A;

--accent-primary:  #6366F1;
--accent-soft:     #818CF8;

--success:         #22C55E;
--warning:         #F59E0B;
--error:           #EF4444;

--border-default:  #27272A;
--border-soft:     #3F3F46;

--glass:           rgba(255,255,255,0.04);
```

---

### Rules

* Same accent across themes
* Only brightness changes, not structure
* Max 3 surface levels

---

## 4. Typography

### Font

* Primary: Inter / System UI
* Fallback: sans-serif

### Scale

| Type    | Size | Weight |
| ------- | ---- | ------ |
| H1      | 28px | 600    |
| H2      | 22px | 600    |
| H3      | 18px | 500    |
| Body    | 14px | 400    |
| Caption | 12px | 400    |

### Rules

* Max 3 sizes per screen
* Avoid mixing weights excessively

---

## 5. Spacing System

Use fixed spacing scale only:

```json
{
  "xs": 4,
  "sm": 8,
  "md": 16,
  "lg": 24,
  "xl": 32
}
```

### Rules

* No random spacing (e.g. 13px, 27px)
* Layout padding: 24px or 32px only

---

## 6. Border Radius

```json
{
  "sm": "6px",
  "md": "10px",
  "lg": "16px"
}
```

---

## 7. Elevation & Shadows

### Soft Elevation

```css
box-shadow: 0 4px 20px rgba(0,0,0,0.25);
```

### Neumorphism Depth

* Light: subtle outer + inner shadow
* Dark: glow + soft shadow

### Rules

* Never use harsh shadows
* Depth should feel smooth, not heavy

---

## 8. Glassmorphism Rules

* Background blur (8–16px)
* Low opacity overlays
* Thin borders (1px, low contrast)
* Use only on cards, modals, sidebar

---

## 9. Layout System

### Grid

* 12-column grid
* Max width: 1200–1280px

### Structure

* Sidebar (fixed)
* Header (top)
* Content area (scrollable)

---

## 10. Core Components

### Button

Variants:

* Primary
* Secondary
* Ghost

States:

* Default
* Hover
* Active
* Disabled
* Loading

Behavior:

* Hover → slight brightness + lift
* Click → scale 0.98

---

### Card

* Glass + soft elevation
* Rounded (12–16px)
* Used for all containers

---

### Input

* Glass style
* Soft border
* Focus → accent glow

---

### Badge

* Soft pill shape
* Low saturation colors

---

### Table (BOQ Critical)

* Clean rows
* Subtle separators
* No heavy borders
* Inline editable fields

---

### Timeline (Milestones)

* Horizontal stepper
* States:

  * Completed
  * Active
  * Pending

---

## 11. Interaction System

### Timing

* 150–250ms (standard)
* Ease-in-out

### Rules

* No abrupt transitions
* Consistent motion everywhere

---

## 12. States (Mandatory)

All components must support:

* Default
* Hover
* Active
* Disabled
* Loading
* Error

---

## 13. Key Screens

### Customer

* Project creation (stepper)
* AI design selection
* Bid comparison
* Milestone tracking
* Escrow dashboard

### Vendor

* Project discovery
* BOQ builder
* Milestone execution
* Payments dashboard

### Admin

* Dispute console
* Escrow monitor
* User management

---

## 14. UX Principles

### Customer

* “My money is safe”
* “Everything is transparent”

### Vendor

* “I can work faster”
* “I get paid on time”

---

## 15. Do / Don’t

### ✅ Do

* Use tokens
* Reuse components
* Keep UI minimal

### ❌ Don’t

* Add random colors
* Use multiple accent colors
* Break spacing rules
* Design screen-by-screen without system

---

## 16. Implementation Notes

* Use shared UI package (`/packages/ui`)
* Follow component-driven development
* Integrate with Storybook
* No inline styles outside system

---

## 17. Final Goal

The product should feel like:
👉 A premium financial + design control system

Not:
❌ A generic marketplace
❌ A flashy design tool

---

END OF DOCUMENT
