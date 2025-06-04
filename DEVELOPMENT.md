# Development Guide - Fractree Logo Generator

## 📁 Project Structure

The project has been refactored from a single monolithic HTML file into a well-organized, modular architecture:

```
fractree-elements/
├── index.html                 # Main HTML structure
├── assets/
│   ├── css/
│   │   └── styles.css         # All styling (responsive design)
│   └── js/
│       ├── mobile.js          # Mobile menu management
│       ├── geometry.js        # Mathematical calculations & SVG generation
│       ├── animation.js       # Animation loops & video recording
│       └── main.js            # Main application logic & orchestration
├── img/                       # Project images
├── README.md                  # Project documentation
└── DEVELOPMENT.md             # This file
```

## 🧩 Module Overview

### 1. **index.html**
- Clean HTML structure without inline styles or scripts
- Includes all necessary form controls and SVG containers
- References external CSS and JavaScript modules

### 2. **assets/css/styles.css**
- Complete responsive styling for desktop, tablet, and mobile
- Organized with clear sections and comments
- Mobile-first approach with progressive enhancement
- CSS custom properties and modern layout techniques

### 3. **assets/js/mobile.js** - `MobileMenuManager`
- Handles responsive mobile menu behavior
- Touch/click event management
- Auto-close functionality
- iOS zoom prevention on input focus

### 4. **assets/js/geometry.js** - `GeometryEngine`
- Mathematical calculations for fractal spoke generation
- SVG element creation and manipulation
- Mask generation for layering effects
- Reusable geometry utilities

### 5. **assets/js/animation.js** - `AnimationEngine`
- Animation loop management with `requestAnimationFrame`
- Parameter velocity calculations and updates
- Video recording with MediaRecorder API
- Canvas synchronization for export

### 6. **assets/js/main.js** - `FractreeApp`
- Main application orchestration
- Parameter management and control binding
- Render pipeline coordination
- Component initialization and lifecycle

## 🔧 Development Workflow

### Local Development

1. **Start a local server** (required for CORS and module loading):
   ```bash
   # Python 3
   python3 -m http.server 8080
   
   # Node.js (if you have http-server installed)
   npx http-server -p 8080
   
   # PHP
   php -S localhost:8080
   ```

2. **Open in browser**: `http://localhost:8080`

### File Dependencies

The JavaScript modules must be loaded in this specific order:
```html
<script src="assets/js/mobile.js"></script>      <!-- No dependencies -->
<script src="assets/js/geometry.js"></script>    <!-- No dependencies -->
<script src="assets/js/animation.js"></script>   <!-- No dependencies -->
<script src="assets/js/main.js"></script>        <!-- Depends on all above -->
```

## 🛠️ Making Changes

### Adding New Parameters

1. **Update `main.js`**: Add to `paramList` array
2. **Update `index.html`**: Add form controls with proper IDs
3. **Update CSS**: Add any necessary styling

### Modifying Geometry

- Edit calculations in `geometry.js` → `GeometryEngine` class
- Most spoke generation logic is in `buildSpokes()` method
- Mask generation is in `createMask()` method

### Changing Animation Behavior

- Edit `animation.js` → `AnimationEngine` class
- Main loop is in `animationLoop()` method
- Parameter updates in `updateParameters()` method

### Styling Updates

- All styling is in `assets/css/styles.css`
- Organized by component sections
- Responsive breakpoints clearly marked

## 🎯 Code Quality Guidelines

### JavaScript

- Use ES6+ features (classes, arrow functions, const/let)
- Document public methods with JSDoc comments
- Follow consistent naming conventions
- Prefer composition over inheritance
- Handle errors gracefully with try/catch

### CSS

- Use semantic class names
- Follow BEM methodology where appropriate
- Mobile-first responsive design
- Use CSS custom properties for theming
- Comment complex calculations or hacks

### HTML

- Semantic markup with proper accessibility
- Form labels and ARIA attributes where needed
- Logical document structure
- Progressive enhancement approach

## 📱 Browser Compatibility

### Core Features
- **Modern browsers**: Full support (Chrome 60+, Firefox 55+, Safari 11+)
- **Mobile browsers**: Responsive design with touch support

### Advanced Features
- **Video Recording**: Chromium-based browsers only (Chrome, Edge, Brave, Opera)
- **Canvas API**: Modern browser support required

## 🐛 Debugging

### Common Issues

1. **Modules not loading**: Check console for CORS errors, ensure local server is running
2. **Animation not working**: Verify all modules loaded in correct order
3. **Recording fails**: Check browser compatibility (Chromium-based required)
4. **Mobile menu issues**: Test on actual devices, not just browser dev tools

### Development Tools

- **Browser DevTools**: Console, Network, Elements tabs
- **Mobile Testing**: Chrome DevTools device simulation + real devices
- **Performance**: Use Browser Performance tab for animation profiling

## 🚀 Production Deployment

### Minification (Optional)
- CSS: Use tools like `cssnano` or `clean-css`
- JavaScript: Use tools like `terser` or `uglify-js`

### CDN Considerations
- All resources are relative paths
- Can be easily deployed to any static hosting
- No build process required

### Performance Tips
- Enable gzip compression on server
- Consider service worker for offline functionality
- Optimize SVG generation for large spoke counts

## 🧪 Testing

### Manual Testing Checklist
- [ ] All parameter sliders work
- [ ] Color pickers update display
- [ ] Animation plays/pauses correctly
- [ ] Recording works in supported browsers
- [ ] Mobile menu functions on touch devices
- [ ] Responsive design at various screen sizes

### Automated Testing (Future)
- Unit tests for geometry calculations
- Integration tests for rendering pipeline
- Visual regression tests for consistent output

## 📚 Further Improvements

### Potential Enhancements
- TypeScript conversion for better type safety
- Web Components for better encapsulation
- Service Worker for offline functionality
- WebGL rendering for better performance
- Preset management system
- Export to different formats (PNG, SVG, GIF) 