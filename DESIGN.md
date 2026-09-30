---
name: Tripick Public Landing Page
description: "An editorial, photo-led introduction to Tripick's travel-photo curation app."
colors:
  ground: "#f6f6f7"
  paper: "#ffffff"
  ink: "#101117"
  muted: "#666b76"
  blue: "#2166e8"
  blue-deep: "#164fc0"
  blue-wash: "#edf3ff"
  line: "#d8dbe2"
  brand-ink: "#0e1740"
  photo-placeholder: "#dce2e7"
typography:
  display:
    fontFamily: 'Inter, "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "clamp(3.3rem, 4.6vw, 4.6rem)"
    fontWeight: 900
    lineHeight: 1.18
    letterSpacing: "-0.04em"
  headline:
    fontFamily: 'Inter, "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "clamp(2.35rem, 4vw, 3.8rem)"
    fontWeight: 730
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  body:
    fontFamily: 'Inter, "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "0.005em"
  action:
    fontFamily: 'Inter, "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "17px"
    fontWeight: 650
    lineHeight: 1.2
  brand:
    fontFamily: 'Inter, "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "24px"
    fontWeight: 760
    lineHeight: 1
    letterSpacing: "-0.035em"
  nav:
    fontFamily: 'Inter, "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "15px"
    fontWeight: 520
    lineHeight: 1.4
  label:
    fontFamily: 'Inter, "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  photo: "8px"
  hero-leading: "32px 0 0 32px"
  phone-screen: "12.5% / 6.4%"
  pill: "999px"
spacing:
  page-gutter: "clamp(22px, 4vw, 64px)"
components:
  brand-lockup:
    textColor: "{colors.brand-ink}"
    typography: "{typography.brand}"
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
    padding: "0 24px 0 30px"
    height: "62px"
  button-primary-hover:
    backgroundColor: "{colors.blue-deep}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
  navigation-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.nav}"
  language-switch:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "44px"
  privacy-link:
    backgroundColor: "transparent"
    textColor: "{colors.blue-deep}"
    typography: "{typography.action}"
  hero-photo-stage:
    backgroundColor: "{colors.photo-placeholder}"
    rounded: "{rounded.hero-leading}"
  chapter-photo:
    backgroundColor: "{colors.photo-placeholder}"
    rounded: "{rounded.photo}"
  review-sequence:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    height: "76px"
  privacy-band:
    backgroundColor: "{colors.blue-wash}"
    textColor: "{colors.ink}"
---

# Design System: Tripick Public Landing Page

## Overview

**Creative North Star: "A Trip Told in Frames"**

This iOS-inspired web introduction treats each journey as an editorial sequence of photographs. A cool paper ground and deep, heavy typography leave room for the landscape to carry the color; the actual Tripick phone screen overlaps the coastal sunset image to make the product concrete. Locally hosted Inter and Noto Sans SC variable fonts carry both English and Simplified Chinese without changing the page's visual voice.

The page opens with a promise and one in-page action, then moves through travel chapters, a review sequence, and a quiet privacy section before closing. On desktop, copy and a wide photograph share the hero while the phone screen crosses the image; on mobile, copy stacks above a full-bleed image and phone. The later photo pair changes from a horizontal chapter line to a vertical sequence. Motion is brief and restrained: the hero settles into place and the chapter imagery resolves as it enters view. The app wraps these sequences in MotionConfig with reduced motion set to follow the user preference; CSS also disables smooth scrolling and nearly cancels native transition durations when reduced motion is requested. Chinese is the first-visit language; the header switch exposes the English version and remembers the choice.

**Key Characteristics:**
- Editorial travel photography is the main visual material; the real app screen is product proof.
- Heavy, high-contrast headlines sit above softer explanatory copy.
- Tripick blue marks the action, a small number of highlights, and privacy wayfinding.
- Spacious chapter transitions replace a generic grid of feature cards.
- The same composition adapts to desktop and mobile, with separate Chinese and English copy.

## Colors

The interface keeps one vivid blue family for action and uses the photographs, rather than extra UI accents, for warmth and color.

### Primary
- **Tripick Blue**: the main in-page action, the final phrase of the hero headline, and the privacy icon.
- **Deep Tripick Blue**: hover and text-link states, numbered process markers, and smaller wayfinding accents.
- **Pale Privacy Blue**: a full-width tonal shift that distinguishes the privacy section without introducing a card grid.

### Neutral
- **Cool Paper Ground**: the page background, framing the photos with a quiet, slightly cool white.
- **Paper White**: CTA foreground and clean highlights.
- **Deep Ink**: primary copy and the accessible focus-independent text hierarchy.
- **Soft Slate**: explanatory copy and lower-priority navigation.
- **Cool Divider**: fine header, footer, and list rules.
- **Brand Navy**: the Tripick wordmark text in the header and footer.
- **Photo Mist**: fallback beneath image plates while a photo is loading or unavailable.

**The Blue Action Rule.** Keep blue concentrated on the action, the hero's closing phrase, and small interaction cues. Let the travel images supply the warm sunset hues.

## Typography

**Display Font:** Inter variable and Noto Sans SC variable, with the platform sans-serif stack as fallback. Both variable files are hosted locally.

**Body Font:** The same Inter / Noto Sans SC stack, so the page does not introduce a second typographic voice.

**Character:** The display is broad, dark, and confident; supporting copy is calmer and more open. Chinese and English share the hierarchy, with a more compact fluid display size for the English hero.

### Hierarchy
- **Display** (weight 900; fluid size and tight leading): the three-line hero promise. The active final line takes the blue accent.
- **Headline** (weight 730; fluid size): chapter, curation, privacy, and closing section titles. Keep these visibly quieter than the hero.
- **Brand** (weight 760; compact leading): the Tripick wordmark in the header and footer.
- **Body** (regular weight; generous leading): explanatory paragraphs. Keep line lengths close to the current narrow text measures rather than stretching copy across a wide image area.
- **Action** (semibold; compact leading): pill CTA and privacy link text.
- **Navigation and label** (medium to semibold): links, image captions, sample notes, and numbered review steps. Labels stay small and secondary.

**The Heavy Promise Rule.** Reserve the heaviest display weight for the hero promise; let body and chapter copy remain readable and restrained.

## Layout

The content is centered within a 1600px maximum width with a fluid page gutter. The desktop header uses a three-part brand, navigation, and language-switch arrangement. The hero pairs a narrow text column with a broad image stage; the stage reaches the viewport edge and carries the overlapping phone. The next photo chapter enters as a wide horizontal strip, with its short label set to the side.

The process chapter pairs copy with two images and a fine connecting rule. The curation section pairs explanatory copy with three numbered review steps. The privacy region breaks out to full width with copy and a compact list; the closing action returns to the centered page measure. These open sections rely on whitespace and hairline dividers instead of boxed feature cards.

The stylesheet changes the composition at 1120px, 800px, and 390px. At the mobile breakpoint, navigation moves out of the header, the hero becomes one column, chapter images stack, the connector turns vertical, and the privacy and curation regions become single-column. The footer wraps into a compact two-column arrangement. Keep every text block and CTA readable in both locales, whose line lengths differ.

## Elevation & Depth

Depth comes primarily from image overlap, the real phone frame, restrained dividers, and the pale privacy band. Most content stays flat against the page ground. The phone frame carries a diffuse drop shadow (`0 18px 18px rgb(16 17 23 / 18%)`); the CTA gains a soft blue-tinted shadow only on hover (`0 12px 24px rgb(33 102 232 / 18%)`). Image placeholders sit under the responsive photo sources so loading does not expose an empty rectangle.

### Shadow Vocabulary
- **Phone lift** (`filter: drop-shadow(0 18px 18px rgb(16 17 23 / 18%))`): separates the overlapping device from the landscape.
- **CTA hover lift** (`box-shadow: 0 12px 24px rgb(33 102 232 / 18%)`): a temporary response to a pointer hover, paired with a slight upward move.

## Shapes

Pill shapes are reserved for the primary action and the language control. Photo chapters have modest rounded edges; the desktop hero photograph softens only its leading corners and runs flush to the right edge. The phone uses the supplied device-frame asset and a curved screen mask. Navigation remains unboxed, and the privacy area is a full-width color field rather than a card.

## Components

- **Brand lockup:** supplied Tripick mark beside a compact wordmark; keep it quiet and left-aligned in both header and footer.
- **Main navigation:** one-line desktop links with text-only hover color. It gives way to the footer links on narrow screens.
- **Language switch:** a light capsule button with a generous hit area, visible keyboard focus, and a label naming the language it will switch to.
- **Primary action link:** a blue capsule with a right arrow. It scrolls to the process section; it is an anchor styled as a button, not a download control.
- **Hero photo stage:** a coastal sunset plate with a real Tripick app screenshot inside a supplied iPhone frame. Preserve the overlap and keep the image caption small.
- **Chapter moment:** a travel image followed by a short caption and an explicit illustrative-sample note.
- **Review sequence:** three ruled rows move from on-device organization through user review to confirmation in Photos.
- **Privacy band:** a lock glyph, one explanation, a privacy link, and three short trust points on a pale blue field.

## Do's and Don'ts

### Do
- Keep Chinese and English copy in the same typographic and spatial system; Chinese is the initial locale.
- Let the coastal and mountain photographs lead, and keep the app screenshot and brand mark sourced from the actual assets.
- Keep sample travel imagery labeled as illustrative and preserve the current in-page path to the process section.
- Use blue for actions, a few highlights, and state cues; use whitespace and rules to organize the rest.

### Don't
- Add an App Store or download action while availability remains unconfirmed in `PRODUCT.md`.
- Invent maps, route planning, new product claims, or app-screen controls that are not in the product source.
- Recast the chapter narrative as a generic grid of equal feature cards or turn the travel photos into decorative thumbnails.
- Present illustrative travel scenes as customer photos or testimonials.
