# Image Split Animation

A React component that transforms an image into a high-contrast drawing, shatters it into animated slices, and reassembles it as the full-color image. No CSS framework required.

**Note:** This component only works with PNG images.

## Dependencies

- [React](https://react.dev) 18+
- [Framer Motion](https://www.framer.com/motion/) 10+

## Installation

1. Install Framer Motion if you don't have it:

```bash
npm install framer-motion
```

2. Copy `src/components/ImageSplitAnimation.tsx` into your project.

## Usage

### Next.js

```tsx
import ImageSplitAnimation from "@/components/ImageSplitAnimation";

export default function Page() {
  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ImageSplitAnimation src="/photo.png" alt="A photo" />
    </div>
  );
}
```

### React (Vite, CRA, etc.)

```tsx
import ImageSplitAnimation from "./components/ImageSplitAnimation";

function App() {
  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ImageSplitAnimation src="/photo.png" alt="A photo" />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | **required** | Image source URL |
| `alt` | `string` | `""` | Image alt text |
| `className` | `string` | — | CSS class for the container |
| `slices` | `number` | `3` | Number of vertical slices |
| `width` | `number` | `400` | Container width in pixels |
| `height` | `number` | `400` | Container height in pixels |
| `dark` | `boolean` | `true` | Drawing style: `true` for white strokes, `false` for black |
| `objectFit` | `"contain" \| "cover" \| "fill" \| "none"` | `"contain"` | How the image fits its container |
| `autoPlay` | `boolean` | `true` | Whether the animation loops automatically |
| `scatterDistance` | `{ x: number, y: number }` | `{ x: 500, y: 300 }` | How far slices scatter |
| `rotationRange` | `number` | `35` | Max rotation of scattered slices (degrees) |
| `drawingContrast` | `{ slope: number, intercept: number }` | `{ slope: 5, intercept: -1.5 }` | Controls the ink drawing effect intensity |
| `timing` | `TimingConfig` | see below | Phase durations in milliseconds |

### Timing

```tsx
<ImageSplitAnimation
  src="/photo.png"
  timing={{
    drawingHold: 2000,  // how long the drawing is shown
    scatter: 1600,      // how long pieces stay scattered
    reassemble: 1800,   // how long reassembly takes
    colorHold: 1500,    // how long the full-color image is shown
    fadeOut: 800,        // fade out before looping
  }}
/>
```

## Examples

### Subtle animation

```tsx
<ImageSplitAnimation
  src="/portrait.png"
  slices={2}
  scatterDistance={{ x: 200, y: 100 }}
  rotationRange={10}
/>
```

### Dramatic shatter

```tsx
<ImageSplitAnimation
  src="/photo.png"
  slices={5}
  scatterDistance={{ x: 800, y: 500 }}
  rotationRange={60}
/>
```

### Light background

```tsx
<div style={{ background: "white" }}>
  <ImageSplitAnimation src="/photo.png" dark={false} />
</div>
```

### Softer drawing

```tsx
<ImageSplitAnimation
  src="/photo.png"
  drawingContrast={{ slope: 3, intercept: -0.8 }}
/>
```

## Animation Flow

1. Full assembled drawing is shown
2. Drawing shatters into scattered slices
3. Slices reassemble as the full-color image
4. Full-color image holds
5. Fades out and loops

## License

MIT
