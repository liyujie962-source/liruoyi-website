import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        photos: './photos.html',
        letter: './letter.html',
        chat: './chat.html'
      }
    }
  },
  server: {
    open: '/index.html'
  }
});