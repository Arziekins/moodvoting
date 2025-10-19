# Mood Check! - Quick Design Reference

## 🎨 Color Palette (Use These Classes)

```jsx
// Kahoot-inspired colors
className="kahoot-red"      // Red button/card (#E21B3C)
className="kahoot-blue"     // Blue button/card (#1368CE)
className="kahoot-yellow"   // Yellow button/card (#FFA602)
className="kahoot-green"    // Green button/card (#26890C)
className="kahoot-purple"   // Purple button/card (#7B3FF2)
```

## 🪟 Key Design Components

### Buttons
```jsx
// Primary action button
<button className="btn-kahoot kahoot-blue">
  Click Me
</button>

// Success action
<button className="btn-kahoot kahoot-green">
  Submit
</button>

// Destructive action
<button className="btn-kahoot kahoot-red">
  Delete
</button>
```

### Cards
```jsx
// Mood card with color variant
<div className="mood-card">
  <div className="flip-card flipped">
    <div className="card-front card-cover-blue">
      Front Content
    </div>
    <div className="card-back card-content">
      Back Content
    </div>
  </div>
</div>
```

### Containers
```jsx
// Liquid glass container (Apple 2025 style)
<div className="liquid-glass rounded-3xl p-6">
  Content here
</div>

// Gradient animated background
<div className="gradient-animated p-6">
  Header content
</div>
```

## ✨ Animation Classes

```jsx
// Fade in with scale
className="fade-in-scale"

// Celebration (on success)
className="celebrate"

// Floating effect
className="float"

// Subtle bounce
className="bounce-subtle"

// Pulse animation
className="pulse-slow"

// Shimmer loading
className="shimmer"
```

## 📝 Typography

```jsx
// Gradient text (multi-color)
<h1 className="gradient-text-kahoot">
  Heading
</h1>

// Font weights
className="font-black"      // 900 - Use for headings
className="font-bold"       // 700 - Use for subheadings
className="font-semibold"   // 600 - Use for labels
```

## 📐 Spacing (8px Grid)

```jsx
// Padding
p-2  // 8px
p-4  // 16px
p-6  // 24px
p-8  // 32px

// Margins
m-2  // 8px
m-4  // 16px
m-6  // 24px
m-8  // 32px

// Gaps
gap-2  // 8px
gap-4  // 16px
gap-6  // 24px
```

## 🎯 Border Radius

```jsx
rounded-xl   // 12px - Small elements
rounded-2xl  // 16px - Medium elements
rounded-3xl  // 24px - Large elements
```

## 🎨 Common Patterns

### Status Banner
```jsx
<div className="liquid-glass rounded-2xl p-6 border-2 border-blue-200">
  <div className="flex items-center space-x-3">
    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
    <span className="text-lg font-black">Status Message</span>
  </div>
</div>
```

### Progress Bar
```jsx
<div className="progress-bar">
  <div className="progress-fill" style={{ width: '60%' }} />
</div>
```

### User Avatar
```jsx
<div className="w-10 h-10 kahoot-purple rounded-full flex items-center justify-center text-white font-black">
  A
</div>
```

### Badge
```jsx
<span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black uppercase">
  Admin
</span>
```

## 🎮 Interactive Elements

### Slider
```jsx
<input
  type="range"
  min="1"
  max="10"
  className="mood-slider bg-gradient-to-r from-red-300 via-yellow-300 to-green-300"
/>
```

### Input Field
```jsx
<input
  type="text"
  className="w-full px-5 py-4 border-3 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all bg-white text-gray-800 font-bold"
/>
```

## 📱 Responsive Breakpoints

```jsx
// Mobile first, then scale up
sm:   // 640px+
md:   // 768px+
lg:   // 1024px+
xl:   // 1280px+
2xl:  // 1536px+

// Example
<div className="text-base sm:text-lg md:text-xl">
  Responsive text
</div>
```

## ♿ Accessibility Checklist

- [ ] Minimum 44x44px touch targets
- [ ] 4.5:1 color contrast for text
- [ ] Focus visible (ring-4)
- [ ] Semantic HTML
- [ ] Alt text for images
- [ ] ARIA labels where needed

## 🎨 Design Tokens

### Colors
```
Primary:   #7B3FF2 (Purple)
Success:   #26890C (Green)
Warning:   #FFA602 (Yellow)
Error:     #E21B3C (Red)
Info:      #1368CE (Blue)
```

### Shadows
```
sm:  0 2px 8px rgba(0,0,0,0.1)
md:  0 4px 16px rgba(0,0,0,0.12)
lg:  0 8px 32px rgba(0,0,0,0.15)
xl:  0 12px 48px rgba(0,0,0,0.2)
```

## 🚀 Quick Start

### 1. Create a new page
```jsx
export default function NewPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="liquid-glass rounded-3xl p-8">
          <h1 className="gradient-text-kahoot text-4xl mb-4">
            Page Title
          </h1>
          {/* Your content */}
        </div>
      </div>
    </div>
  );
}
```

### 2. Add a button
```jsx
<button className="btn-kahoot kahoot-blue">
  <Icon className="w-5 h-5" />
  <span>Button Text</span>
</button>
```

### 3. Add a card
```jsx
<div className="mood-card">
  <div className="flip-card">
    <div className="card-front card-cover-purple">
      ?
    </div>
    <div className="card-back card-content">
      Content
    </div>
  </div>
</div>
```

## 📚 Resources

- **Tailwind Docs**: https://tailwindcss.com
- **Apple HIG**: https://developer.apple.com/design/human-interface-guidelines
- **Lucide Icons**: https://lucide.dev
- **Kahoot Brand**: https://kahoot.com

## 💡 Pro Tips

1. **Always use the 8px spacing grid** - Keeps everything aligned
2. **Prefer transform over other properties** - Better performance
3. **Use font-black for headings** - Maximum impact
4. **Test on mobile first** - That's where users are
5. **Add transitions to interactive elements** - Feels polished
6. **Use ring-4 for focus states** - Accessibility + beautiful
7. **Combine gradients with shadows** - Creates depth
8. **Uppercase + tracking-wide** - Modern button style

## 🎉 That's It!

Use these patterns consistently for a cohesive, Kahoot-style interface that follows Apple's Human Interface Guidelines.

**Happy designing! 🚀**

