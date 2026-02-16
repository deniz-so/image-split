# Image Split Animation

A React component that splits an image into slices, scatters them, and animates them back together as a high-contrast drawing. Built with Framer Motion.

> Works best with PNGs or SVGs.

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

```tsx
import ImageSplitAnimation from "@/components/ImageSplitAnimation";

export default function Page() {
  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ImageSplitAnimation src="/photo.png" />
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
| `slices` | `number` | `3` | Number of slices |
| `width` | `number` | `400` | Container width in pixels |
| `height` | `number` | `400` | Container height in pixels |
| `dark` | `boolean` | `true` | Drawing style: `true` for white strokes on dark, `false` for black strokes on light |
| `objectFit` | `"contain" \| "cover" \| "fill" \| "none"` | `"contain"` | How the image fits its container |
| `direction` | `"vertical" \| "horizontal"` | `"vertical"` | Slice direction |
| `autoPlay` | `boolean` | `true` | Whether the animation loops automatically |
| `scatterDistance` | `{ x: number, y: number }` | `{ x: 500, y: 300 }` | How far slices scatter |
| `rotationRange` | `number` | `35` | Max rotation of scattered slices (degrees) |
| `drawingContrast` | `{ slope: number, intercept: number }` | `{ slope: 5, intercept: -1.5 }` | Controls the drawing effect intensity |
| `timing` | `TimingConfig` | see below | Phase durations in milliseconds |

### Timing

```tsx
<ImageSplitAnimation
  src="/photo.png"
  timing={{
    delay: 500,        // pause before construction starts
    reassemble: 2500,  // how long pieces take to fly in
    hold: 2000,        // how long the completed drawing is shown
    fadeOut: 800,       // fade out before looping
  }}
/>
```

## Animation Flow

1. Slices start scattered and invisible
2. Each slice flies in and fades in to its position (staggered)
3. Completed drawing holds
4. Fades out and loops

## Examples

### Gentle entrance

```tsx
<ImageSplitAnimation
  src="/portrait.png"
  slices={2}
  scatterDistance={{ x: 200, y: 100 }}
  rotationRange={10}
/>
```

### Dramatic construction

```tsx
<ImageSplitAnimation
  src="/photo.png"
  slices={5}
  scatterDistance={{ x: 800, y: 500 }}
  rotationRange={60}
/>
```

### Horizontal slices on light background

```tsx
<div style={{ background: "white" }}>
  <ImageSplitAnimation src="/photo.png" dark={false} direction="horizontal" />
</div>
```

### Softer drawing

```tsx
<ImageSplitAnimation
  src="/photo.png"
  drawingContrast={{ slope: 3, intercept: -0.8 }}
/>
```

## License

MIT
