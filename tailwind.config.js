/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html", // Busca classes Tailwind em todos os arquivos HTML na raiz
    "./assets/js/*.js", // Se você usar classes Tailwind em JS
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}