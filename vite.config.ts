import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Replace process.env.API_KEY with the actual value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Prevent "process is not defined" error in browser
      'process.env': {},
    },
  };
});