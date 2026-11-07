/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'carnaval-primary': '#E11D48', // Carmesí festivo oficial
        'carnaval-gold': '#F59E0B',    // Amarillo/Ámbar Canto a la Tierra
        'carnaval-magenta': '#D946EF', // Magenta Familia Castañeda
        'carnaval-cyan': '#38BDF8',    // Cyan Día de Negros / Tablados
        'carnaval-dark': {
          DEFAULT: '#0F172A',          // Fondo refinado carbón/pizarra
          card: '#1E293B',             // Superficie elevada
          deeper: '#090D16',           // Fondo ultra profundo
        },
        carnaval: {
          primary: '#E11D48',
          gold: '#F59E0B',
          magenta: '#D946EF',
          cyan: '#38BDF8',
          dark: '#0F172A',
          card: '#1E293B',
          violet: "#8b5cf6",
          purple: "#7c3aed",
          fuchsia: "#d946ef",
          pink: "#ec4899",
          rose: "#e11d48",
          amber: "#f59e0b",
          darker: "#030712",
        },
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(225, 29, 72, 0.35)',
        'glow-md': '0 0 25px -4px rgba(217, 70, 239, 0.45)',
        'glow-lg': '0 0 35px -5px rgba(225, 29, 72, 0.55)',
        'glow-gold': '0 0 25px -4px rgba(245, 158, 11, 0.5)',
        'glow-rose': '0 0 30px -4px rgba(225, 29, 72, 0.5)',
        'glow-magenta': '0 0 30px -4px rgba(217, 70, 239, 0.5)',
        'glow-cyan': '0 0 25px -4px rgba(56, 189, 248, 0.45)',
        'glow-festive': '0 0 30px -4px rgba(225, 29, 72, 0.45), 0 0 20px -2px rgba(245, 158, 11, 0.35)',
        'carnaval-deep': '0 25px 50px -12px rgba(15, 23, 42, 0.9), 0 0 30px -5px rgba(225, 29, 72, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'bounce-short': 'bounceShort 0.4s ease-in-out 1',
        'gradient-x': 'gradientX 8s ease infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        bounceShort: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        gradientX: {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
      }
    },
  },
  plugins: [],
}
