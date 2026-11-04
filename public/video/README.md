# SIRRA Sensory Video Asset Specification & Creative Brief

This directory holds sensory video loops for the SIRRA digital experience. When video files are added here and match the expected naming convention, they are automatically detected at build/dev time by `scripts/scan-videos.js` and rendered seamlessly through the `<VideoSlot>` component.

> [!IMPORTANT]
> Do NOT generate, fake, or download stock video. All assets must be authentic video produced or curated and approved by the brand team.

---

## Technical Specifications
- **Container / Codec**: MP4 (H.264 video, strictly no audio tracks / muted) or WebM (VP9).
- **File Size**: Under 8MB per clip (optimized for instant streaming over cellular networks).
- **Duration**: 8 to 12 seconds seamless infinite loop.
- **Aspect Ratio & Resolution**:
  - Hero Video: 1080 × 1350 (4:5 portrait) or 1080 × 1920 (9:16 vertical), centered framing.
  - Scent Pages (`/scent/[slug]`): 1080 × 1350 (4:5 portrait).
- **Audio**: None. Videos must be exported without any audio stream.
- **File Naming Convention**:
  - `hero.mp4` / `hero.webm`
  - `wayfarer.mp4` / `wayfarer.webm`
  - `equinox.mp4` / `equinox.webm`
  - `silk-smoke.mp4` / `silk-smoke.webm`
  - `heartthrob.mp4` / `heartthrob.webm`

---

## Creative Brief (Per-Scent Personality & Visual Mood)
*Note: The following visual suggestions are drawn strictly from the existing brand copy and are marked as suggestions for the brand team to review and approve.*

### 1. Wayfarer (`wayfarer.mp4`)
- **Brand Identity**: The Wanderer's Flex — *“Top-class is a place you carry, not a place you’re from.”*
- **Fragrance Profile**: Fresh / Aquatic / Liberating Mineral Woody
- **Visual Mood (Suggestions)**: Movement and doorways. Fluid transit through open architectural arches, sunlit coastal breezes, sea salt and mineral textures, moving shadows across clean thresholds with an effortless sense of belonging anywhere.

### 2. Equinox (`equinox.mp4`)
- **Brand Identity**: The Quiet Top — *“Some people announce the top. Others just are it.”*
- **Fragrance Profile**: Refined Woody / Warm Amber / Cashmere
- **Visual Mood (Suggestions)**: Stillness and light through curtains. Soft afternoon light filtering through sheer linen curtains, gentle atmospheric drift, tactile warm wood surfaces, quiet settled confidence that needs no performance or audience.

### 3. Silk & Smoke (`silk-smoke.mp4`)
- **Brand Identity**: The Bold Roots — *“Your roots aren’t what you soften. They’re what you lead with.”*
- **Fragrance Profile**: Spicy / Smoky / Rich Leather
- **Visual Mood (Suggestions)**: Textile, saffron and smoke. Rich woven textures, saffron threads suspended in warm amber light, slow rising ribbons of aromatic oud smoke, unapologetic heritage worn with pride and quiet strength.

### 4. Heartthrob (`heartthrob.mp4`)
- **Brand Identity**: The Open Heart — *“Feeling everything, fully, is its own kind of top-class.”*
- **Fragrance Profile**: Warm Amber / Luminous Floral / Gourmand
- **Visual Mood (Suggestions)**: Warmth and devotion. Luminous golden hour warmth, gentle unfolding floral petals, honeyed amber glow, unguarded sincerity and radiant all-in devotion.

---

## Fallback Behavior
When no video file exists in this directory, the website displays the high-resolution persona photograph with a subtle scale transform (1.0 to 1.06) and a discreet development-only badge indicating the missing video slot. When `prefers-reduced-motion` or `Save-Data` is enabled, the still poster is rendered automatically to preserve bandwidth and user comfort.
