module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kyxel: {
          900: '#030417',
          800: '#071020',
          700: '#0b1724',
          cyan: '#00f0ff',
          teal: '#00d1c0'
        }
      },
      boxShadow: {
        soft: '0 8px 30px rgba(2,6,23,0.6)'
      },
      fontFamily: {
        display: ['"Oswald"', 'Inter', 'sans-serif']
      },
      letterSpacing: {
        nav: '.15em'
      }
    }
  },
  plugins: []
}
