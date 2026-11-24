import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  // Rende leggibili dall'app anche le variabili che iniziano con SUPABASE_
  envPrefix: ['VITE_', 'SUPABASE_'],
});
