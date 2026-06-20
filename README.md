# 2015

A design system extracted from the aesthetic of 2015-era web widgets.

---

## Origin

In 2015, I built two small tools on CodePen — a Pomodoro timer and a calculator. They weren't part of a design system. There were no tokens, no component library, no documentation. Just two self-contained widgets that happened to share a visual instinct: saturated single-hue backgrounds, buttons with soft-square corners, shadows that glowed with the same colour as the card they lived under, and white bold text on everything.

A decade later, those two CodePens became the source material for this project.

---

## What it is

**2015** is a component library built by reverse-engineering the visual language of those widgets and scaling it into a full design system. Every decision — the border radii, the shadow values, the colour relationships, the inset display screen on inputs — traces back to something in the original source code.

The centrepiece is a colour engine that generates an entire palette from a single hero hue. Pick any colour. The page background, card surface, buttons, surfaces, shadows, and watermark text are all computed from it automatically. The three original apps each had their own hue — red for the timer, teal for the calculator, lime for the todo list — and all three still ship as presets.

---

## What it looks like

Saturated. Tactile. A little loud.

Cards float above the page on coloured drop shadows — not the generic grey shadows you get from copying a Tailwind component, but shadows tinted to match the card's own hue. Buttons are pill-shaped. Icon buttons are perfect circles. Inputs look sunken, like the display screen on the original calculator. Everything is white text on saturated colour, with no neutral surface in sight.

It is not subtle. It knows this.

---

## The original apps

Three apps ship with the library, each a faithful recreation of the design language applied to a different problem.

**Pomodoro** — a focus timer. Red card, circular increment buttons, square action buttons. Starts at 25 minutes.

**Calculator** — a four-function calculator. Teal card, display screen with inset shadow, operator keys in a lighter tint. C and ÷ share the top row with the display.

**Todo** — a task list. Lime card, task rows with the same inset treatment as the calculator display, semantic red for delete and green for complete.

---

## Components

Buttons · Cards · Forms · Navbar · Badges · Chips · Alerts · Avatar · Tabs · Dropdown · Modal · Toast · Progress Bar · Table · List Group · Spinner · Empty State · Divider · Breadcrumb · Tooltips · 12-column Grid

---

## Design decisions worth noting

**`border-radius: 999px` on buttons.** A true pill at any width. No oval distortion.

**`border-radius: 50%` on icon buttons.** Always a perfect circle regardless of what the base button inherits.

**`border-radius: 10px` on inputs.** Fixed pixels, not percentage. Percentage border-radius on wide elements creates asymmetric ovals — a bug in the original apps that has been corrected here.

**`border-radius: 2%` on cards.** Kept exactly from the source. On a 280px wide card it resolves to ~5.6px — just enough to feel intentional without looking rounded.

**Coloured shadows.** Every shadow uses the theme hue, not `rgba(0,0,0,x)`. This is the most distinctive single decision in the system and the hardest thing to replicate by accident.

**Inset shadow on inputs.** The calculator display used `inset 2px 3px 9px 1px rgba(0,0,0,0.27)` to make the screen look physically recessed. Every input in the library inherits this.

---

## Files

```
dist/        2015.css · 2015-theme.js · 2015-interact.js
docs/        Living documentation with live theme switcher
examples/    pomodoro.html · calculator.html · todo.html
```

---

## Honest assessment

This is not a general-purpose design system. It has no neutral surface, no light mode, no dark text path. Everything lives on saturated colour. That makes it genuinely difficult to use for content-heavy interfaces, dashboards, or anything requiring long reading sessions.

What it is good for: tools, widgets, small focused apps, anything where the UI is the product and restraint is not the goal.

It is a very specific aesthetic, done consistently.

---

MIT License
