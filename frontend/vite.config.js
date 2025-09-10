const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Assuming FastAPI backend will run at port 8000
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
