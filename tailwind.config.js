/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        syllabo: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#5E2784',
          900: '#4B1E6D',
          950: '#3B1254',
        },
        surface: {
          canvas: '#FBF9F5',
          sidebar: '#F5EFEB',
          card: '#FFFFFF',
        },
        pastel: {
          coral: {
            bg: '#FCE8E6',
            border: '#F6CAC6',
            accent: '#D9534F',
          },
          peach: {
            bg: '#FDF0DD',
            border: '#F8DBB5',
            accent: '#D97706',
          },
          lilac: {
            bg: '#EAE8FC',
            border: '#D0CBFB',
            accent: '#6366F1',
          },
          mint: {
            bg: '#E2F6EE',
            border: '#BFE9D7',
            accent: '#059669',
          },
        }
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      }
    },
  },
  plugins: [],
}
