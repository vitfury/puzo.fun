import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import '@xyflow/react/dist/style.css'

// Clean up any old service workers that might be causing redirects to ?v=BUILD_VERSION
if ('serviceWorker' in navigator) {
  // Check if we're being redirected to a broken URL
  const urlParams = new URLSearchParams(window.location.search);
  const hasBrokenVersion = urlParams.get('v') === 'BUILD_VERSION';
  
  if (hasBrokenVersion || window.location.pathname === '/index.html') {
    // Unregister all service workers if we detect a redirect issue
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('Old service worker unregistered due to redirect issue');
            // Clear URL and reload
            window.history.replaceState({}, '', window.location.pathname);
            window.location.reload();
          }
        });
      }
    });
    
    // Also clear all caches
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      });
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
