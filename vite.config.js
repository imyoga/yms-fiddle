import { defineConfig } from 'vite';

export default defineConfig({
  // Enable dependency pre-bundling
  optimizeDeps: {
    include: [
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/language',
      '@codemirror/lang-html',
      '@codemirror/lang-css',
      '@codemirror/lang-javascript',
      '@codemirror/theme-one-dark',
      '@replit/codemirror-minimap',
      'file-saver',
      'jszip',
      'codemirror'
    ]
  },
  // Provide proper MIME types for imported assets
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
}); 