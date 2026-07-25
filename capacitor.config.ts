import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.roofscout.app',
  appName: 'RoofScout.io',
  webDir: 'www',
  // The WebView loads the real deployed site, not the placeholder www/
  // folder — this app has server components, API routes, and a database,
  // so it can't be statically bundled. TODO: replace with the real Netlify
  // production URL once deployed (Phase 1 of the plan).
  server: {
    url: 'https://REPLACE-WITH-NETLIFY-URL.netlify.app',
    cleartext: false,
  },
};

export default config;
