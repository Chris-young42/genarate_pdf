import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'apple-bg': '#FAFAFA',
        'apple-card': '#FFFFFF',
        'apple-text': '#1D1D1F',
        'apple-secondary': '#86868B',
        'apple-link': '#0066CC',
        'apple-separator': 'rgba(0,0,0,0.06)',
        neon: {
          blue: '#00d4ff',
          purple: '#b347ea',
          pink: '#ff2d95',
          cyan: '#00e5ff',
          dark: '#0a0a1a',
          darker: '#050510',
          card: '#111133',
          border: '#1e1e4a',
        },
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"PingFang SC"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        apple: '0 4px 20px rgba(0,0,0,0.04)',
        'apple-hover': '0 8px 40px rgba(0,0,0,0.08)',
        glass: '0 8px 32px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.02)',
        'glass-hover': '0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
        'glass-sm': '0 2px 8px rgba(0,0,0,0.03)',
        neon: '0 0 15px rgba(0, 212, 255, 0.3), 0 0 45px rgba(0, 212, 255, 0.1)',
        'neon-lg': '0 0 30px rgba(179, 71, 234, 0.4), 0 0 60px rgba(0, 212, 255, 0.2)',
        'neon-glow': '0 0 20px rgba(0, 212, 255, 0.5)',
      },
      animation: {
        'fade-up': 'fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(179, 71, 234, 0.6)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
