const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Extract head and body
const headMatch = html.match(/<head>([\s\S]*?)<\/head>/);
const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);

let headContent = headMatch ? headMatch[1] : '';
let bodyContent = bodyMatch ? bodyMatch[1] : '';

// Remove script tags from bodyContent since we'll load them in App.jsx
bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/g, '');

// Clean up paths in head
headContent = headContent.replace(/href="assets\//g, 'href="/assets/');

// Write original HTML content for React
fs.writeFileSync('frontend/src/original.html', bodyContent);

// Update frontend/index.html
let viteHtml = fs.readFileSync('frontend/index.html', 'utf8');
viteHtml = viteHtml.replace(/<title>.*?<\/title>/, '<title>VEMU Library</title>');
viteHtml = viteHtml.replace('</head>', headContent + '</head>');
fs.writeFileSync('frontend/index.html', viteHtml);

// Create App.jsx
const appJsx = `import { useEffect } from 'react';
import rawHtml from './original.html?raw';

function App() {
  useEffect(() => {
    // Inject scripts dynamically so they run after DOM is mounted
    const scripts = [
      "/assets/js/data.js",
      "/assets/js/utils.js",
      "/assets/js/auth.js",
      "/assets/js/admin.js",
      "/assets/js/librarian.js",
      "/assets/js/faculty.js",
      "/assets/js/student.js",
      "/assets/js/main.js"
    ];

    scripts.forEach(src => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false; // ensure they execute in order
      document.body.appendChild(script);
    });

    return () => {
      // cleanup on unmount
      document.querySelectorAll('script[src^="/assets/js/"]').forEach(el => el.remove());
    };
  }, []);

  return <div id="legacy-app" dangerouslySetInnerHTML={{ __html: rawHtml }} />;
}

export default App;
`;
fs.writeFileSync('frontend/src/App.jsx', appJsx);

console.log('Migration complete!');
