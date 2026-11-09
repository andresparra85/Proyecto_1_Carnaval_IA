/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'carnaval-dark': '#070a12',    // Fondo principal profundo Andina Neón
        'carnaval-card': 'rgba(15, 23, 42, 0.75)', // Tarjetas translúcidas
        'carnaval-crimson': '#e11d48', // Carmesí festivo
        'carnaval-gold': '#f59e0b',    // Oro Sol de los Pastos
        'carnaval-cyan': '#06b6d4',    // Cyan Glaciar
        'carnaval-primary': '#E11D48', // Carmesí festivo oficial
        'carnaval-magenta': '#D946EF', // Magenta Familia Castañeda
        'carnaval-fuchsia': '#d946ef', // Fucsia Neón Midnight Carnival
        'dark-obsidian': '#050811',    // Base nocturna Obsidian Night
        'carnaval-rose': '#f43f5e',      // Fucsia Carnaval (Primario Eléctrico)
        'carnaval-flame': '#fb923c',     // Naranja Candela / Oro Intenso
        'carnaval-tropical': '#22d3ee',  // Cian / Turquesa Tropical
        'carnaval-electric': '#a855f7',  // Púrpura Eléctrico
        'carnaval-night-base': '#0d041a',   // Violeta Nocturno Profundo
        'carnaval-night-purple': '#120726', // Violeta Nocturno Alterno
        carnaval: {
          dark: '#070a12',
          card: 'rgba(15, 23, 42, 0.75)',
          crimson: '#e11d48',
          gold: '#f59e0b',
          cyan: '#06b6d4',
          primary: '#E11D48',
          magenta: '#D946EF',
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
        'neon-crimson': '0 0 25px -2px rgba(225, 29, 72, 0.5), 0 0 40px -5px rgba(225, 29, 72, 0.25)',
        'neon-gold': '0 0 25px -2px rgba(245, 158, 11, 0.5), 0 0 40px -5px rgba(245, 158, 11, 0.25)',
        'neon-cyan': '0 0 25px -2px rgba(6, 182, 212, 0.5), 0 0 40px -5px rgba(6, 182, 212, 0.25)',
        'neon-card': '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px -5px rgba(225, 29, 72, 0.2)',
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
        'neon-diffuse-fuchsia': '0 0 60px -12px rgba(217, 70, 239, 0.45)',
        'neon-diffuse-cyan': '0 0 60px -12px rgba(6, 182, 212, 0.45)',
        'neon-diffuse-gold': '0 0 60px -12px rgba(245, 158, 11, 0.45)',
        'hud-glass': '0 10px 30px rgba(0, 0, 0, 0.5)',
        'neon-rose': '0 0 20px rgba(244, 63, 94, 0.5)',
        'neon-amber-vivid': '0 0 15px rgba(245, 158, 11, 0.4)',
        'neon-emerald-vivid': '0 0 15px rgba(16, 185, 129, 0.4)',
        'neon-purple-vivid': '0 0 15px rgba(168, 85, 247, 0.4)',
        'neon-tropical': '0 0 25px rgba(34, 211, 238, 0.45)',
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
