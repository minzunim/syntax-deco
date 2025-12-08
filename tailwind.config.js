/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0f172a',
          700: '#334155',
          500: '#64748b',
          100: '#e2e8f0',
        },
        accent: {
          500: '#2563eb',
          400: '#3b82f6',
          50: '#eff6ff',
        },
      },
      boxShadow: {
        soft: '0 8px 24px -12px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
};
