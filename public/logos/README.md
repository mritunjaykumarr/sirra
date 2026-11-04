# Marketplace Logos

Official full-colour logo files go here for:
- `amazon`
- `flipkart`
- `meesho`

### Supported Extensions
The system automatically searches for files in this priority order:
1. `.svg` (preferred, vector)
2. `.png`
3. `.webp`
4. `.jpg`

For example:
- `amazon.svg` or `amazon.png`
- `flipkart.svg` or `flipkart.png`
- `meesho.svg` or `meesho.png`

### Requirements
- Transparent background
- Do not recolour, stretch, or redraw
- Follow each marketplace's brand guidelines
- **Note**: A dev server restart is needed after adding or removing logo files so the build-time helper can detect them.
- In their absence, an accessible typographic fallback in Archivo 800 is rendered automatically.
