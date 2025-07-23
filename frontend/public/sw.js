// Simple Service Worker for WBSO Simpel
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Let the browser handle all fetch requests normally
  return;
}); 