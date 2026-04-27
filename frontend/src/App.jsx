import { useEffect } from 'react';
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
