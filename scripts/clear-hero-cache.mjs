/**
 * Utility script to clear old hero image cache from localStorage
 * Run this in the browser console to clear any old cached data
 */

const clearHeroImageCache = () => {
  const keysToRemove = [
    'hero-images-cache',
    'hero-images-cache-timestamp',
    'hero-images-cache-version'
  ];

  let cleared = 0;
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      cleared++;
      console.log(`✓ Cleared: ${key}`);
    }
  });

  if (cleared === 0) {
    console.log('No hero image cache found in localStorage');
  } else {
    console.log(`\n✓ Cleared ${cleared} cache entries`);
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.clearHeroImageCache = clearHeroImageCache;
}

console.log(`
To clear old hero image cache, run this in your browser console:
  clearHeroImageCache()

Or manually remove these keys:
  - hero-images-cache
  - hero-images-cache-timestamp
  - hero-images-cache-version
`);

