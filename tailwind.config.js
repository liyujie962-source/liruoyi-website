/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./main.js", "./photos.html", "./letter.html", "./chat.html"],
  theme: {
    extend: {
      colors: {
        dark: '#121212',
        lightPurple: '#E5E1FF',
        grayLight: '#CCCCCC',
        grayMid: '#999999',
        grayDark: '#1A1A1A',
        grayDarker: '#2A2A2A'
      },
      fontFamily: {
        caveat: ['Caveat', 'cursive'],
        inter: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}