import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  server: {
    headers: {
      "X-Content-Type-Options": "nosniff",
    }
  },
  preview: {
    headers: {
      "X-Content-Type-Options": "nosniff",
    }
  }
})
