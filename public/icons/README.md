# PWA Icons

This directory contains all PWA icon assets for EyeCare app.

## Required Icons

The following icon sizes are **required** for PWA functionality:

- `icon-192.png` (192x192) - Minimum for Add to Home Screen
- `icon-512.png` (512x512) - Splash screen on Android
- `icon-maskable.png` (512x512) - Adaptive icon with safe zone
- `apple-touch-icon.png` (180x180) - iOS home screen icon

## Optional Icons (recommended)

- `icon-72.png` (72x72)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-144.png` (144x144)
- `icon-152.png` (152x152)
- `icon-384.png` (384x384)

## Icon Design Guidelines

### Theme

- **Subject**: Eye + timer/20 symbol
- **Style**: Modern, flat design, high contrast
- **Colors**: Primary blue (#3B82F6) + white background
- **Simplicity**: Clear and recognizable even at small sizes

### Maskable Icon

- **Safe Zone**: Keep important content within center 80%
- **Purpose**: Supports adaptive icons on Android
- **Testing**: Use https://maskable.app/ to validate

### Apple Touch Icon

- **Size**: 180x180 pixels
- **Background**: Solid color (no transparency)
- **Corners**: Will be rounded automatically by iOS

## Tools for Icon Generation

1. **Figma / Sketch** - Design original icon
2. **ImageMagick** - Batch resize:
   ```bash
   convert icon-512.png -resize 192x192 icon-192.png
   convert icon-512.png -resize 384x384 icon-384.png
   # etc...
   ```
3. **Real Favicon Generator** - https://realfavicongenerator.net/
4. **Maskable.app Editor** - https://maskable.app/editor

## Current Status

**⚠️ PLACEHOLDER ICONS NEEDED**

The current icons are placeholders. For production deployment, replace with professionally designed icons following the guidelines above.

## Installation Instructions

1. Design base icon (512x512)
2. Generate all required sizes
3. Create maskable version with safe zone
4. Optimize with TinyPNG or ImageOptim
5. Place files in this directory
6. Verify in Chrome DevTools > Application > Manifest

## Validation Checklist

- [ ] All required sizes present
- [ ] Maskable icon has 80% safe zone
- [ ] Apple touch icon has solid background
- [ ] All icons optimized (<200KB total)
- [ ] Icons display correctly in manifest
- [ ] No console errors when loading icons
