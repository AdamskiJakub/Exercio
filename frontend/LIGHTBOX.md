# Lightbox Component Refactoring

## Overview
Refactored the image lightbox into modular, reusable components using React Portal for proper modal behavior.

## Architecture

### Core Components

1. **`Portal`** (`/components/ui/portal.tsx`)
   - Reusable portal component
   - Renders children outside the React DOM hierarchy
   - Handles SSR safety with mounted state
   - Use case: Modals, tooltips, popovers that need to escape parent overflow/z-index

2. **`LightboxControls`** (`/components/ui/lightbox-controls.tsx`)
   - Close button (X)
   - Navigation arrows (Previous/Next)
   - Counter (1 / 5)
   - Reusable for any lightbox/gallery component

3. **`LightboxMedia`** (`/components/ui/lightbox-media.tsx`)
   - Displays images or videos
   - Auto-detects media type from URL
   - Handles click propagation
   - Responsive sizing (max 80vw x 80vh)

4. **`ImageLightbox`** (`/components/ui/image-lightbox.tsx`)
   - Main lightbox component
   - Keyboard navigation (Escape, Arrow keys)
   - Click backdrop to close
   - Body scroll lock when open

## Features

✅ **React Portal** - Renders modal outside React tree, prevents z-index/overflow issues
✅ **Keyboard Navigation** - Escape to close, Left/Right arrows to navigate
✅ **Video Support** - Auto-detects and plays MP4/WebM videos
✅ **Scroll Lock** - Prevents body scrolling when lightbox is open
✅ **Click to Close** - Click backdrop to close, click media to prevent close
✅ **Responsive** - Media sized to 80% of viewport (80vw x 80vh)
✅ **Navigation Controls** - Previous/Next buttons for galleries
✅ **Counter** - Shows current position (e.g., "3 / 7")

## Usage

```tsx
import { ImageLightbox } from '@/components/ui/image-lightbox';

function MyComponent() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const images = ['/uploads/image1.jpg', '/uploads/image2.jpg'];
  
  return (
    <>
      <img 
        src={images[0]} 
        onClick={() => {
          setLightboxIndex(0);
          setLightboxOpen(true);
        }}
      />
      
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
```

## Benefits

1. **Modularity** - Components can be reused independently
2. **Maintainability** - Each component has single responsibility
3. **Testability** - Easier to test isolated components
4. **Reusability** - Portal, Controls, and Media can be used in other contexts
5. **Type Safety** - Full TypeScript support with interfaces

## File Structure

```
frontend/src/components/ui/
├── portal.tsx              # Reusable portal component
├── lightbox-controls.tsx   # Navigation & controls
├── lightbox-media.tsx      # Image/Video display
└── image-lightbox.tsx      # Main lightbox component
```

## Future Enhancements

- [ ] Add swipe gestures for mobile
- [ ] Add zoom functionality
- [ ] Add download button
- [ ] Add share functionality
- [ ] Add lazy loading for galleries
- [ ] Add thumbnails navigation
