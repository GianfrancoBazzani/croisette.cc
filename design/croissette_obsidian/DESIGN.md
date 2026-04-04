```markdown
# Design System Strategy: High-End Editorial Intelligence

## 1. Overview & Creative North Star
**Creative North Star: "The Predictive Croisette "**

This design system moves away from the sterile, "off-the-shelf" SaaS aesthetic toward a high-end editorial experience. It is designed to feel like a bespoke financial concierge—authoritative yet effortless. By leveraging a warm, tactile base of Peach Cream contrasted against the sharp, cold intelligence of Deep Charcoal, we create a visual tension that represents the intersection of human intuition and AI precision.

The layout philosophy rejects the rigid, boxy grid. Instead, we embrace **intentional asymmetry** and **tonal layering**. Elements should feel "placed" rather than "slotted," using overlapping components and high-contrast typography scales to guide the user’s eye. This is a system where breathing room is a functional requirement, not a luxury.

---

## 2. Colors & Surface Philosophy
The palette is rooted in sophisticated warmth and high-action data visualization.

*   **Primary (Data Pink - #af1c57):** Reserved for the "pulse" of the app—CTAs and critical data highlights. It represents active intelligence.
*   **Secondary (Coral Sunset - #8f4c35):** Used for accents and gradients, adding a humanistic, sunset-like warmth to the AI-driven data.
*   **Neutral (The Peach & Charcoal Axis):** The `surface` (#fef8f6) is the canvas. The `inverse_surface` (#32302f) represents "The Engine"—dark, focused areas where complex data resides.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections or containers. Layout boundaries must be defined exclusively through:
1.  **Background Color Shifts:** Placing a `surface_container_low` element against a `surface` background.
2.  **Tonal Transitions:** Using the hierarchy of `surface_container_lowest` to `highest` to create logical groupings.

### Surface Hierarchy & Nesting
Treat the UI as a physical desk of fine paper. 
*   **Base:** `surface` (The desk).
*   **Secondary Layer:** `surface_container_low` (The document folder).
*   **Focused Layer:** `surface_container_lowest` (The active sheet).
This nesting creates depth through value rather than structure.

### The Glass & Gradient Rule
To achieve a signature feel, floating elements (Modals, Navigation Bars) must use **Glassmorphism**. Use a semi-transparent `surface_container_lowest` (approx. 70% opacity) with a `32px` backdrop blur. 
**Signature Texture:** Utilize a subtle linear gradient for primary CTAs transitioning from `primary` (#af1c57) to `primary_container` (#d1396f) at a 135-degree angle. This prevents the "flat" look of standard UI.

---

## 3. Typography
We use **Inter** as a singular, powerful typeface, relying on extreme weight and size contrast to communicate authority.

*   **Display & Headline (Bold):** Use `display-lg` and `headline-lg` for key brand moments. These should have a slight negative tracking (-0.02em) to feel tighter and more "editorial."
*   **UI Labels (SemiBold):** Use `label-md` for buttons and navigation. The SemiBold weight ensures legibility against complex data backgrounds.
*   **Body (Regular):** The `body-md` is the workhorse. Ensure line height is generous (1.6x) to maintain the airy, effortless feel of the brand.

The hierarchy is "Top-Heavy." Large headlines should be significantly larger than body text to create a clear entry point for the user’s eye, mimicking the layout of a luxury financial journal.

---

## 4. Elevation & Depth
Depth in this system is a result of **Tonal Layering**, not structural shadows.

*   **The Layering Principle:** Avoid traditional shadows. Instead, stack your surface tokens. A `surface_container_lowest` card sitting on a `surface_container_low` section provides a soft, natural "lift."
*   **Ambient Shadows:** If a floating effect is required (e.g., a high-priority AI notification), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(29, 27, 26, 0.06)`. The shadow color is a tinted version of `on_surface`, never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline_variant` token at **15% opacity**. This creates a "Ghost Border" that suggests a boundary without breaking the "No-Line" rule.
*   **Radial Line Art:** Integrate the concentric radial line art at a low opacity (5-8%) behind key cards. These lines should appear to emanate from "Deep Charcoal" cards, symbolizing AI intelligence radiating outward.

---

## 5. Components

### Buttons
*   **Primary:** Background is the `primary` to `primary_container` gradient. 
*   **Iconography:** Every primary CTA must include the proprietary **upward-diagonal arrow** icon in the trailing position.
*   **Shape:** `rounded-md` (0.375rem) for a modern, sharp-yet-approachable feel.
*   **States:** On hover, the button should subtly scale (1.02x) and increase its shadow diffusion.

### Cards (The "Intelligent" Container)
*   **Standard Card:** Use `surface_container_low`. No border.
*   **AI/Premium Card:** Use `inverse_surface` (Deep Charcoal) with `on_primary` (White) text. This high-contrast shift signals to the user that they are looking at "Engine" data or AI-driven insights.

### Lists & Data
*   **Dividers:** Forbidden. 
*   **Separation:** Use `48px` or `64px` of vertical white space from the spacing scale to separate list items, or alternate background tints between `surface` and `surface_container_low`.

### Input Fields
*   **Style:** Minimalist. No bottom line. Use a `surface_container_high` background with a `label-sm` floating above the field. 
*   **Focus State:** The background shifts to `surface_container_highest` with a 1px "Ghost Border" in `primary`.

### Navigation
*   **Top Bar:** Glassmorphic (`surface_container_lowest` @ 70% + blur). 
*   **Active State:** Indicated by a `Data Pink` dot below the text, not a thick underline.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. A text block on the left balanced by a "Deep Charcoal" card on the right that is slightly offset vertically.
*   **Do** use the concentric line art as a background texture to break up large empty areas of Peach Cream.
*   **Do** prioritize "Data Pink" for the most important number on any screen.
*   **Do** use overlapping elements. A card can slightly overlap a header to create a sense of physical layering.

### Don't
*   **Don't** use 100% opaque borders or dividers. They kill the editorial flow.
*   **Don't** use standard "Drop Shadows." Only use low-opacity, high-blur Ambient Shadows.
*   **Don't** use generic icons. Always use the proprietary upward-diagonal arrow for actions involving movement, growth, or investing.
*   **Don't** crowd the interface. If it feels "full," remove an element or increase the padding. The brand is "effortless." Effortless brands have room to breathe.

---
**Director's Note:** Every pixel should feel intentional. If an element exists, it should be there because it provides clarity or adds to the "Croisette " aesthetic. If you find yourself reaching for a default border or a standard grid, step back and ask: "How would a luxury magazine layout this data?"```