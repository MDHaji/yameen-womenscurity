import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'SafeGuard - Women Safety & Emergency SOS',
          short_name: 'SafeGuard',
          description: 'Personal safety companion for Android with one-tap SOS, live GPS location sharing, discreet disguise mode, and emergency siren.',
          theme_color: '#0f0f1a',
          background_color: '#0f0f1a',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          categories: ['lifestyle', 'security', 'utilities'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'Trigger SOS',
              short_name: 'SOS',
              description: 'Quick emergency alert trigger',
              url: '/?action=sos',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Fake Call',
              short_name: 'Fake Call',
              description: 'Incoming fake phone call',
              url: '/?action=fakecall',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Discreet Notes',
              short_name: 'Notes',
              description: 'Open disguised notes view',
              url: '/?discreet=true',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
