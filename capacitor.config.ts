import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.roofscout.app',
  appName: 'RoofScout',
  webDir: 'www',
  // The WebView loads the real deployed site, not the placeholder www/
  // folder — this app has server components, API routes, and a database,
  // so it can't be statically bundled.
  server: {
    url: 'https://roof-scout.org',
    cleartext: false,
  },
};

export default config;
