const fs = require('fs');
const path = require('path');

// Create a simple SVG icon programmatically
// For a carpooling app, we'll create a car icon with modern design
const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="200" fill="url(#grad1)"/>
  <!-- Car Body -->
  <path d="M200 600 L200 500 Q200 450 250 450 L350 450 L400 350 L624 350 L674 450 L774 450 Q824 450 824 500 L824 600 L750 600 L750 700 Q750 750 700 750 L650 750 L650 800 Q650 850 600 850 L424 850 Q374 850 374 800 L374 750 L324 750 Q274 750 274 700 L274 600 Z" fill="#FFFFFF" opacity="0.95"/>
  <!-- Car Windows -->
  <path d="M400 450 L400 550 L500 550 L500 450 Z" fill="#E0E7FF" opacity="0.8"/>
  <path d="M524 450 L524 550 L624 550 L624 450 Z" fill="#E0E7FF" opacity="0.8"/>
  <!-- Car Wheels -->
  <circle cx="350" cy="700" r="60" fill="#1F2937"/>
  <circle cx="350" cy="700" r="40" fill="#4B5563"/>
  <circle cx="674" cy="700" r="60" fill="#1F2937"/>
  <circle cx="674" cy="700" r="40" fill="#4B5563"/>
  <!-- People Icons -->
  <circle cx="300" cy="500" r="25" fill="#6366F1"/>
  <circle cx="724" cy="500" r="25" fill="#8B5CF6"/>
</svg>`;

// Write SVG file
const svgPath = path.join(__dirname, 'assets', 'icon.svg');
fs.mkdirSync(path.dirname(svgPath), { recursive: true });
fs.writeFileSync(svgPath, svgIcon);

console.log('✅ SVG icon created at:', svgPath);
console.log('Note: You may need to convert this SVG to PNG using a tool like ImageMagick or online converter');
