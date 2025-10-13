# Farm Ranch Media - Complete Platform Specification

## Project Overview

**Farm Ranch Media** is a premium agricultural marketing website featuring documentary-style photography and film services for farms and ranches. The platform emphasizes minimalist black-and-white design with dramatic visual storytelling.

**Target Audience:** Agricultural businesses, ranchers, farm owners seeking professional media services
**Design Philosophy:** Ultra-minimal, luxury editorial aesthetic with brutalist influences
**Tech Stack:** Next.js 15.5, React 19, TypeScript, Tailwind CSS 4

---

## Design System

### Color Palette

**Primary Colors:**
- Pure Black: `#000000` - Primary text, buttons, borders
- Pure White: `#ffffff` - Backgrounds, inverted text
- Neutral Gray Scale:
  - 50: `#fafafa`
  - 100: `#f5f5f5`
  - 200: `#e5e5e5`
  - 300: `#d4d4d4`
  - 400: `#a3a3a3`
  - 500: `#737373`
  - 600: `#525252`
  - 700: `#404040`
  - 800: `#262626`
  - 900: `#171717`

**Usage:**
- Backgrounds: White (#ffffff) or Neutral-50 (#fafafa)
- Text: Black (#000000) for primary, Neutral-600/700 for secondary
- Hero overlays: Black with 60-70% opacity (`bg-black/70`)

### Typography

**Font Families:**
- **Sans-serif (Body):** Inter (300 weight default)
  - Variable: `--font-inter`
  - Light weight (300) for body text
  - Medium (500) for labels
  - Semibold (600) for emphasis

- **Serif (Display):** Playfair Display (400, 700, 900)
  - Variable: `--font-playfair`
  - Used for large headlines and hero text
  - Weights: 400 (Regular), 700 (Bold), 900 (Black)

**Type Scale:**
```typescript
'body-sm': ['1.125rem', { lineHeight: '1.65', fontWeight: '300' }],
'body': ['1.25rem', { lineHeight: '1.65', fontWeight: '300' }],
'body-lg': ['1.375rem', { lineHeight: '1.65', fontWeight: '300' }],
'eyebrow': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.15em', fontWeight: '600' }],
'h6': ['1.125rem', { lineHeight: '1.25', letterSpacing: '0.05em', fontWeight: '600' }],
'h5': ['1.375rem', { lineHeight: '1.25', letterSpacing: '0.02em', fontWeight: '600' }],
'h4': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
'h3': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '400' }],
'h2': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' }],
'h1': ['clamp(3rem, 6vw, 6rem)', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '400' }],
'hero': ['clamp(3.5rem, 8vw + 1rem, 10rem)', { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '400' }],
```

**Text Shadows:**
- Light: `text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4)`
- Heavy: `text-shadow: 0 4px 16px rgba(0, 0, 0, 0.6)`
- Used on hero text over images

### Spacing System

Custom spacing scale (base 0.75rem):
```
0.5: 0.375rem
1: 0.75rem
2: 1.5rem
3: 2.25rem
4: 3rem
5: 3.75rem
6: 4.5rem
7: 5.25rem
8: 6rem
10: 7.5rem
12: 9rem
16: 12rem
20: 15rem
24: 18rem
```

**Section Padding:**
- Mobile: `py-20` (5rem)
- Tablet: `py-28` (7rem)
- Desktop: `py-36` (9rem)

**Container Padding:**
- Default: 1.5rem (24px)
- sm: 2rem (32px)
- md: 3rem (48px)
- lg: 4rem (64px)
- xl: 5rem (80px)
- 2xl: 6rem (96px)

### Shadows

Minimal shadow system:
- `none`: No shadow
- `subtle`: `0 1px 2px 0 rgb(0 0 0 / 0.03)`
- `soft`: `0 2px 8px 0 rgb(0 0 0 / 0.05)`

### Animations

**Keyframe Animations:**
```typescript
fadeIn: '0% { opacity: 0 } → 100% { opacity: 1 }' // 0.8s ease-out
fadeUp: '0% { opacity: 0, translateY(30px) } → 100% { opacity: 1, translateY(0) }' // 1s ease-out
slideIn: '0% { opacity: 0, translateX(-20px) } → 100% { opacity: 1, translateX(0) }' // 0.6s ease-out
scaleIn: '0% { opacity: 0, scale(0.95) } → 100% { opacity: 1, scale(1) }' // 0.3s ease-out
shimmer: Animated background position for loading states
```

**Transition Durations:**
- Fast: 150ms
- Default: 300ms
- Medium: 400ms
- Slow: 600ms

---

## Component Architecture

### Layout Components

#### Header (`components/layout/Header.tsx`)

**Features:**
- Fixed position, transparent initially
- Transforms to white background with shadow on scroll (100px threshold)
- Responsive mobile menu
- Smooth color transitions (300ms duration)

**Navigation Links:**
- Gallery, Work, Services, About, Contact
- Text color changes based on scroll state:
  - Not scrolled: `text-white/80 hover:text-white`
  - Scrolled: `text-neutral-600 hover:text-black`

**CTA Button:**
- Changes variant on scroll: `secondary` → `primary`
- Desktop: Always visible
- Mobile: Inside hamburger menu

**Mobile Menu:**
- Hamburger icon (Menu/X from lucide-react)
- Full-width dropdown
- Border-top separator
- Stacked navigation + CTA button

#### Footer (`components/layout/Footer.tsx`)

**Structure:**
- Black background (`bg-black`)
- White text (`text-white`)
- Multi-column layout (responsive grid)
- Newsletter signup
- Social links
- Legal links (Privacy, Terms)

### Section Components

#### Hero (`components/sections/Hero.tsx`)

**Layout:**
- Full viewport height (`min-h-screen`)
- Centered content vertically and horizontally
- Absolute positioned background image

**Background Image Setup:**
```tsx
<div className="absolute inset-0 w-full h-full">
  <Image
    src="/images/hero-horses.png"
    alt="..."
    fill
    sizes="100vw"
    className="object-cover"
    priority
    quality={85}
  />
  <div className="absolute inset-0 bg-black/70" /> {/* Dark overlay */}
</div>
```

**Content Structure:**
- Eyebrow text: `text-sm text-white/80 uppercase tracking-wide`
- Headline: `text-5xl md:text-6xl font-bold text-white text-shadow-lg`
- Subtext: `text-lg text-white/90 text-shadow`
- CTA Button: White outline style

**Scroll Indicator:**
- Positioned at bottom center
- Animated bounce (ChevronDown icon)
- Smooth scrolls to #services section

#### Services (`components/sections/Services.tsx`)

**Layout:**
- Grid of service cards
- 1 column mobile, 2-3 columns desktop
- Card hover effects (scale, shadow)

**Service Cards:**
- Icon (lucide-react)
- Title (h3)
- Description
- Optional "Learn More" link

**Visual Style:**
- White background cards
- Subtle border (`border-neutral-200`)
- Hover: `transform: scale(1.02)` + shadow

#### Testimonials (`components/sections/Testimonials.tsx`)

**Layout:**
- Centered quote cards
- Carousel/slider on mobile
- Side-by-side on desktop

**Quote Card Structure:**
```tsx
<blockquote className="text-xl italic">
  "..."
</blockquote>
<cite className="text-neutral-600">
  — Name, Business
</cite>
```

#### Call to Action (`components/sections/CallToAction.tsx`)

**Design:**
- Full-width section
- Contrasting background (neutral-50 or black)
- Large headline + subtext
- Prominent CTA button
- Optional contact form

#### Gallery (`components/sections/Gallery.tsx`)

**Critical: Advanced Layout System**

The gallery uses a **masonry/editorial layout system** with multiple visual types. Each image composition is predefined based on the gallery data.

---

## Gallery Visual Types (CRITICAL)

This is the most important section. The gallery supports 15+ different layout patterns inspired by editorial photography magazines.

### Layout Type Definitions

#### 1. **Single Full Bleed**
```typescript
{
  type: 'single',
  images: [{ url: string, alt: string }],
  aspectRatio: '16:9' | '3:2' | '4:3' | 'square'
}
```
- Single image spanning full width
- No borders, minimal padding
- Used for hero gallery images

#### 2. **Side-by-Side (50/50)**
```typescript
{
  type: 'sideBySide',
  images: [
    { url: string, alt: string },
    { url: string, alt: string }
  ],
  gap: 'none' | 'sm' | 'md' | 'lg'
}
```
- Two equal-width images
- Optional gap between (0-32px)
- Responsive: stacks on mobile

#### 3. **2x2 Grid**
```typescript
{
  type: 'grid2x2',
  images: [
    { url: string, alt: string }, // top-left
    { url: string, alt: string }, // top-right
    { url: string, alt: string }, // bottom-left
    { url: string, alt: string }  // bottom-right
  ],
  gap: 'sm' | 'md'
}
```
- Four equal quadrants
- Uniform gap spacing
- Mobile: 2x2 becomes 1 column

#### 4. **Horizontal Split**
```typescript
{
  type: 'horizontalSplit',
  images: [
    { url: string, alt: string, height: '60%' }, // top
    { url: string, alt: string, height: '40%' }  // bottom
  ]
}
```
- Stacked horizontally
- Adjustable height ratios (default 60/40 or 50/50)
- Full width for both images

#### 5. **Vertical Split**
```typescript
{
  type: 'verticalSplit',
  images: [
    { url: string, alt: string, width: '60%' }, // left
    { url: string, alt: string, width: '40%' }  // right
  ]
}
```
- Side-by-side with unequal widths
- Common ratios: 70/30, 60/40, 65/35

#### 6. **Diagonal Split**
```typescript
{
  type: 'diagonalSplit',
  images: [
    { url: string, alt: string },
    { url: string, alt: string }
  ],
  angle: 'topLeftToBottomRight' | 'topRightToBottomLeft'
}
```
- Two images separated by diagonal line
- Uses CSS clip-path
- Modern editorial feel

#### 7. **Circular Inset**
```typescript
{
  type: 'circularInset',
  backgroundImage: { url: string, alt: string },
  insetImage: { url: string, alt: string },
  insetPosition: 'center' | 'topRight' | 'bottomLeft' | 'bottomRight',
  insetSize: 'sm' | 'md' | 'lg' // 20%, 30%, 40% of container
}
```
- Large background image
- Circular cutout showing detail image
- Positioned absolutely over background

#### 8. **Rectangular Inset**
```typescript
{
  type: 'rectangularInset',
  backgroundImage: { url: string, alt: string },
  insets: [
    { url: string, alt: string, position: 'bottomRight', width: '30%' },
    { url: string, alt: string, position: 'topLeft', width: '25%' }
  ]
}
```
- Main image with 1-3 smaller rectangular overlays
- Positioned at corners or edges
- Creates depth and focus

#### 9. **Three Horizontal Strips**
```typescript
{
  type: 'threeHorizontalStrips',
  images: [
    { url: string, alt: string, height: '33.33%' },
    { url: string, alt: string, height: '33.33%' },
    { url: string, alt: string, height: '33.33%' }
  ]
}
```
- Stacked horizontally, equal heights
- Full-bleed edges
- Cinematic letterbox feel

#### 10. **Three Vertical Strips**
```typescript
{
  type: 'threeVerticalStrips',
  images: [
    { url: string, alt: string, width: '33.33%' },
    { url: string, alt: string, width: '33.33%' },
    { url: string, alt: string, width: '33.33%' }
  ]
}
```
- Side-by-side columns, equal widths
- Triptych style

#### 11. **Primary + Secondary Grid**
```typescript
{
  type: 'primarySecondary',
  primaryImage: { url: string, alt: string, area: '70%' },
  secondaryImages: [
    { url: string, alt: string },
    { url: string, alt: string },
    { url: string, alt: string }
  ],
  layout: 'left' | 'right' | 'top' | 'bottom'
}
```
- One large dominant image (60-70% of space)
- 2-4 smaller supporting images in grid
- Layout determines primary position

#### 12. **Panorama**
```typescript
{
  type: 'panorama',
  image: { url: string, alt: string },
  aspectRatio: '21:9' | '32:9', // Ultra-wide
  height: '400px' | '500px' | '600px'
}
```
- Ultra-wide landscape format
- Fixed height, scrollable horizontally on mobile
- Perfect for ranch landscapes

#### 13. **Magazine Spread**
```typescript
{
  type: 'magazineSpread',
  leftPage: { url: string, alt: string },
  rightPage: { url: string, alt: string },
  gutter: '2rem' // Center gap mimicking book spine
}
```
- Two-page magazine layout simulation
- Gutter spacing in center
- Responsive: becomes vertical stack on mobile

#### 14. **Collage Grid**
```typescript
{
  type: 'collage',
  images: Array<{
    url: string,
    alt: string,
    gridArea: string // CSS grid area definition
  }>,
  template: string // CSS grid-template-areas
}
```
- Custom CSS Grid layouts
- Asymmetric compositions
- Example:
```css
grid-template-areas:
  "a a b"
  "c d b"
  "c e e"
```

#### 15. **Overlay Stack**
```typescript
{
  type: 'overlayStack',
  images: [
    { url: string, alt: string, zIndex: 1, offset: { x: 0, y: 0 } },
    { url: string, alt: string, zIndex: 2, offset: { x: '20px', y: '20px' } },
    { url: string, alt: string, zIndex: 3, offset: { x: '40px', y: '40px' } }
  ]
}
```
- Layered images with offset positioning
- Creates depth through z-index stacking
- Polaroid-style effect

---

## Gallery Implementation Details

### Data Structure

**Gallery JSON:**
```typescript
interface GalleryItem {
  id: string;
  category: 'ranch' | 'farm' | 'horses' | 'landscape' | 'aerial' | 'portrait';
  layout: LayoutType; // One of the 15 types above
  images: GalleryImage[];
  metadata?: {
    title?: string;
    description?: string;
    location?: string;
    date?: string;
  };
}

interface GalleryImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}
```

### Gallery Component Structure

```tsx
export function Gallery({ items }: { items: GalleryItem[] }) {
  return (
    <div className="gallery-grid">
      {items.map((item) => (
        <GalleryLayout key={item.id} layout={item.layout} images={item.images} />
      ))}
    </div>
  );
}
```

### Layout Renderer

```tsx
function GalleryLayout({ layout, images }: GalleryLayoutProps) {
  switch (layout.type) {
    case 'single':
      return <SingleLayout image={images[0]} aspectRatio={layout.aspectRatio} />;

    case 'sideBySide':
      return (
        <div className="grid grid-cols-2 gap-4">
          {images.map((img) => (
            <Image key={img.url} {...img} />
          ))}
        </div>
      );

    case 'grid2x2':
      return (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img) => (
            <Image key={img.url} {...img} />
          ))}
        </div>
      );

    // ... other layout types
  }
}
```

### Hover Effects

All gallery images should have:
```css
.gallery-image-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gallery-image-hover:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
}
```

### Lightbox Modal

**Features:**
- Full-screen overlay with blur backdrop
- Image zoom controls
- Left/right navigation arrows
- Close on ESC key or backdrop click
- Swipe gestures on mobile

**Implementation:**
```tsx
<dialog className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
  <button onClick={close} className="absolute top-4 right-4">
    <X className="w-8 h-8 text-white" />
  </button>

  <div className="flex items-center justify-center h-full">
    <Image src={currentImage} alt="..." className="max-h-[90vh] max-w-[90vw]" />
  </div>

  <button onClick={previous} className="absolute left-4 top-1/2 -translate-y-1/2">
    <ChevronLeft className="w-12 h-12 text-white" />
  </button>

  <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2">
    <ChevronRight className="w-12 h-12 text-white" />
  </button>
</dialog>
```

---

## UI Components

### Button (`components/ui/button.tsx`)

**Variants:**
- `primary`: Black background, white text
- `secondary`: White background, black border + text
- `tertiary`: Text only with underline
- `ghost`: Subtle hover background
- `outline`: Black border, transparent background

**Sizes:**
- `sm`: h-10, px-6, text-sm
- `md`: h-12, px-8, text-base
- `lg`: h-14, px-10, text-base
- `xl`: h-16, px-12, text-lg
- `icon`: h-10, w-10

**States:**
- Hover: Inverted colors + scale(0.98)
- Focus: 2px black ring with 4px offset
- Disabled: 40% opacity, no pointer events

### Card (`components/ui/card.tsx`)

**Default Style:**
```tsx
<div className="bg-white border border-neutral-200 rounded-lg p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</div>
```

**Variants:**
- Elevated: Add shadow-soft
- Flat: Remove border, use bg-neutral-50
- Outlined: Thicker border (2px)

### Label (`components/ui/label.tsx`)

Simple label wrapper with proper accessibility:
```tsx
<Label htmlFor="input-id" className="text-sm font-medium">
  Label Text
</Label>
```

### Slider (`components/ui/slider.tsx`)

Radix UI slider with custom styling:
- Track: `bg-neutral-200`
- Filled track: `bg-black`
- Thumb: `bg-white border-2 border-black`
- Size: h-2 track, w-5 h-5 thumb

---

## Page Structure

### Home Page (`app/page.tsx`)

**Sections (in order):**
1. Hero - Full viewport with background image
2. Services - 3-column grid of service offerings
3. Testimonials - Client quotes carousel
4. Call to Action - Contact form or booking CTA
5. Footer

### Gallery Page (`app/gallery/page.tsx`)

**Features:**
- Filter by category (All, Ranch, Farm, Horses, Landscape, Aerial)
- Search functionality
- Masonry grid layout
- Lazy loading images (intersection observer)
- Infinite scroll or pagination

**Filter Implementation:**
```tsx
const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');

const filteredItems = items.filter(item =>
  activeFilter === 'all' || item.category === activeFilter
);
```

---

## Image Management

### Image Locations

**Hero Image:**
- Path: `/public/images/hero-horses.png`
- Dimensions: 1472x816 (16:9 aspect ratio)
- Format: PNG
- Optimization: Next.js Image component with quality=85

**Gallery Images:**
- Path: `/public/images/gallery/[filename].png`
- Total: 132 images (4 images per layout composition)
- Naming convention: Descriptive snake_case with UUID
- Example: `Dominant_stallion_charging_through_monsoon_dust_storm_b65da8a8_0.png`

### Next.js Image Configuration

**next.config.ts:**
```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  qualities: [75, 85, 90, 100],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      port: '',
      pathname: '/**',
    },
  ],
}
```

**Image Component Usage:**
```tsx
// Hero background
<Image
  src="/images/hero-horses.png"
  alt="Horses running through ranch landscape"
  fill
  sizes="100vw"
  priority
  quality={85}
  className="object-cover"
/>

// Gallery images
<Image
  src={imageUrl}
  alt={imageAlt}
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={85}
  className="gallery-image-hover"
/>
```

---

## Tech Stack Details

### Dependencies

**Core:**
- `next`: ^15.5.4 (App Router)
- `react`: ^19.2.0
- `react-dom`: ^19.2.0
- `typescript`: ^5.9.3

**UI Libraries:**
- `@radix-ui/react-label`: ^2.1.7
- `@radix-ui/react-slider`: ^1.3.6
- `lucide-react`: ^0.545.0 (Icons)
- `framer-motion`: ^12.23.24 (Animations)

**Forms:**
- `react-hook-form`: ^7.65.0
- `@hookform/resolvers`: ^5.2.2
- `zod`: ^4.1.12 (Validation)

**Styling:**
- `tailwindcss`: ^4.1.14
- `@tailwindcss/typography`: ^0.5.19
- `@tailwindcss/postcss`: ^4.1.14
- `autoprefixer`: ^10.4.21
- `postcss`: ^8.5.6

**Utilities:**
- `class-variance-authority`: ^0.7.1 (Component variants)
- `clsx`: ^2.1.1 (Conditional classes)
- `tailwind-merge`: ^3.3.1 (Merge Tailwind classes)
- `nuqs`: ^2.7.1 (URL state management)

### Dev Dependencies

- `@types/node`: ^24.7.2
- `@types/react`: ^19.2.2
- `eslint`: ^9.37.0
- `eslint-config-next`: ^15.5.4

---

## File Structure

```
farmranchmedia/
├── app/
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   └── gallery/
│       └── page.tsx             # Gallery page
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Fixed header with scroll detection
│   │   └── Footer.tsx           # Site footer
│   │
│   ├── sections/
│   │   ├── Hero.tsx             # Hero section with background image
│   │   ├── Services.tsx         # Service offerings grid
│   │   ├── Testimonials.tsx    # Client testimonials
│   │   ├── CallToAction.tsx    # CTA section
│   │   └── Gallery.tsx          # Gallery grid with layouts
│   │
│   └── ui/
│       ├── button.tsx           # Button component with variants
│       ├── card.tsx             # Card component
│       ├── label.tsx            # Form label
│       └── slider.tsx           # Range slider
│
├── lib/
│   ├── utils.ts                 # Utility functions (cn helper)
│   ├── constants.ts             # Site config, metadata
│   └── gallery-data.ts          # Gallery items data structure
│
├── public/
│   ├── images/
│   │   ├── hero-horses.png      # Hero background
│   │   └── gallery/             # 132 gallery images
│   └── favicon.svg
│
├── tailwind.config.ts           # Tailwind configuration
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

---

## Key Features

### 1. Performance Optimizations

- **Image Optimization:** Next.js Image component with AVIF/WebP formats
- **Lazy Loading:** Intersection Observer for gallery images
- **Code Splitting:** Next.js automatic code splitting per route
- **Font Optimization:** Google Fonts with `next/font` (swap display)
- **Prefetching:** Next.js Link component prefetch on hover

### 2. Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states (2px ring offset)
- Alt text on all images
- Proper heading hierarchy (h1 → h6)
- Color contrast ratios: AAA (21:1 for black/white)

### 3. SEO

**Metadata (app/layout.tsx):**
```typescript
export const metadata: Metadata = {
  title: {
    default: 'Farm Ranch Media',
    template: '%s | Farm Ranch Media',
  },
  description: 'Documentary-style photography and film for agricultural heritage',
  keywords: [
    'farm photography',
    'ranch videography',
    'agricultural marketing',
    'drone photography',
    'farm branding',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://farmranchmedia.com',
    siteName: 'Farm Ranch Media',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Farm Ranch Media',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

### 4. Responsive Design

**Breakpoints:**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1440px

**Mobile-First Approach:**
- All base styles target mobile
- Use `md:`, `lg:` prefixes for larger screens
- Touch-friendly tap targets (min 44x44px)
- Hamburger menu below 768px
- Gallery: 1 column → 2 → 3 columns

---

## Code Patterns

### 1. Component Pattern

```tsx
'use client'; // Only if using hooks/interactivity

import { ComponentProps } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  description?: string;
  className?: string;
}

export function Component({ title, description, className }: Props) {
  return (
    <div className={cn('base-classes', className)}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
```

### 2. Utility Function (lib/utils.ts)

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:**
```tsx
<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)} />
```

### 3. Constants (lib/constants.ts)

```typescript
export const SITE_CONFIG = {
  name: 'Farm Ranch Media',
  description: 'Documentary-style photography and film for agricultural heritage',
  url: 'https://farmranchmedia.com',
  ogImage: 'https://farmranchmedia.com/og-image.png',
  links: {
    twitter: 'https://twitter.com/farmranchmedia',
    instagram: 'https://instagram.com/farmranchmedia',
  },
};

export const NAV_LINKS = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];
```

---

## Styling Patterns

### 1. Section Wrapper

```tsx
<section className="section-padding container-padding">
  <div className="max-w-7xl mx-auto">
    {/* Content */}
  </div>
</section>
```

### 2. Text Hierarchy

```tsx
{/* Eyebrow */}
<p className="text-eyebrow uppercase text-neutral-600 mb-4">
  Farm & Ranch Media
</p>

{/* Headline */}
<h1 className="text-h1 md:text-hero font-display mb-6">
  Stories Worth Telling
</h1>

{/* Body */}
<p className="text-body text-neutral-700 max-w-2xl">
  Documentary-style photography...
</p>
```

### 3. Interactive States

```tsx
<button className={cn(
  'transition-all duration-300',
  'hover:scale-[0.98] active:scale-[0.96]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4',
  'disabled:opacity-40 disabled:pointer-events-none'
)}>
  Button
</button>
```

---

## Deployment

### Build Configuration

```bash
npm run build  # Creates optimized production build
npm run start  # Starts production server
```

### Environment Variables

```env
NEXT_PUBLIC_SITE_URL=https://farmranchmedia.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Vercel Deployment

- Automatic deployments from `main` branch
- Preview deployments for PRs
- Image optimization via Vercel's CDN
- Edge caching for static assets

---

## Browser Support

**Target:**
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- iOS Safari: Last 2 versions
- Chrome Android: Last 2 versions

**Polyfills Not Required:**
- ES2020+ features supported natively
- Next.js handles necessary transpilation

---

## Development Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

---

## Critical Implementation Notes

### 1. Hero Image Loading

**Problem:** Image with `fill` prop needs explicit parent dimensions.

**Solution:**
```tsx
<div className="absolute inset-0 w-full h-full">
  <Image fill sizes="100vw" ... />
</div>
```

### 2. Service Worker Caching

The site may use Workbox for PWA features. To clear cache during development:
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});
```

### 3. Gallery Image Naming

Gallery images follow a consistent pattern:
```
[Description]_[UUID]_[Index].png

Example:
Dominant_stallion_charging_through_monsoon_b65da8a8_0.png
Dominant_stallion_charging_through_monsoon_b65da8a8_1.png
```

Each layout composition has 4 images (indices 0-3).

---

## Future Enhancements

### Phase 2 Features

1. **Video Integration**
   - Background videos in hero
   - Video gallery with YouTube/Vimeo embeds
   - Custom video player

2. **Blog/Stories**
   - MDX for rich content
   - Case studies with before/after
   - Behind-the-scenes content

3. **Booking System**
   - Calendar integration
   - Stripe payments
   - Service packages

4. **Client Portal**
   - Password-protected galleries
   - Download high-res images
   - Photo selection/favoriting

5. **Advanced Gallery**
   - Tag filtering (season, subject, style)
   - Infinite scroll
   - Keyboard navigation (arrow keys)
   - Share individual images

---

## Contact & Support

**Project:** Farm Ranch Media
**Tech Lead:** Willem van den Berg
**Framework:** Next.js 15 + React 19
**Design System:** Minimal brutalist with editorial layouts

**Key Philosophy:**
"Less is more. Let the photography speak. Every element should serve the story."

---

## Appendix: Gallery Layout Examples

### Example 1: Single Hero Image
```typescript
{
  id: 'hero-1',
  category: 'landscape',
  layout: {
    type: 'single',
    aspectRatio: '21:9'
  },
  images: [
    {
      url: '/images/gallery/arizona-ranch-sunset.png',
      alt: 'Arizona ranch at golden hour with mountain backdrop',
      width: 2400,
      height: 1028
    }
  ],
  metadata: {
    title: 'Golden Hour Ranch',
    location: 'Monument Valley, Arizona',
    date: '2024-08-15'
  }
}
```

### Example 2: Primary + Secondary Grid
```typescript
{
  id: 'comp-2',
  category: 'horses',
  layout: {
    type: 'primarySecondary',
    primaryArea: 70,
    layout: 'left'
  },
  images: [
    {
      url: '/images/gallery/stallion-running_0.png',
      alt: 'Stallion running through dust',
      isPrimary: true
    },
    {
      url: '/images/gallery/stallion-running_1.png',
      alt: 'Close-up of stallion eye'
    },
    {
      url: '/images/gallery/stallion-running_2.png',
      alt: 'Hoof detail in motion'
    },
    {
      url: '/images/gallery/stallion-running_3.png',
      alt: 'Mane flowing in wind'
    }
  ]
}
```

### Example 3: Magazine Spread
```typescript
{
  id: 'spread-1',
  category: 'ranch',
  layout: {
    type: 'magazineSpread',
    gutter: '2rem'
  },
  images: [
    {
      url: '/images/gallery/ranch-left.png',
      alt: 'Ranch life - morning chores',
      position: 'left'
    },
    {
      url: '/images/gallery/ranch-right.png',
      alt: 'Ranch life - evening sunset',
      position: 'right'
    }
  ],
  metadata: {
    title: 'A Day in the Life',
    description: 'From sunrise to sunset on a working ranch'
  }
}
```

---

**END OF SPECIFICATION**

This document contains everything needed to recreate, extend, or understand the Farm Ranch Media platform. Feed this to any Claude instance and they'll know exactly what you're building.
