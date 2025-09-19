import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0', // Use IPv4 wildcard for broader compatibility
    port: 8080,
    open: true, // Automatically open browser on start (optional)
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(), // Conditional plugin
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Maps @/ to src/
      '@server/server/types': path.resolve(__dirname, './src/server/server/src/types.ts'), // Specific mapping for types.ts
    },
  },
  // Optional: Add type checking if using TypeScript
  optimizeDeps: {
    esbuildOptions: {
      tsconfigRaw: {
        compilerOptions: {
          paths: {
            '@/*': ['src/*'],
            '@server/server/types': ['src/server/server/src/types.ts'],
          },
        },
      },
    },
  },
}));