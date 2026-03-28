import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        abyss:      '#06040a',
        deep:       '#0d0917',
        stone:      '#111020',
        slate:      '#1a1728',
        rune:       '#8b5cf6',
        'rune-dim': '#5b3fa6',
        gold:       '#f0b429',
        'gold-dim': '#a07820',
        fire:       '#ff6b2b',
        parchment:  '#e8d5a3',
        mist:       '#7a7090',
        border:     'rgba(139,92,246,0.2)',
      },
      fontFamily: {
        cinzel:  ['var(--font-cinzel)', 'serif'],
        crimson: ['var(--font-crimson)', 'serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'spin-slow':   'spin 12s linear infinite',
        'spin-medium': 'spin 18s linear infinite reverse',
        'spin-fast':   'spin 25s linear infinite',
        'float':       'float 2s ease-in-out infinite',
        'glow-gold':   'glowGold 2s ease-in-out infinite alternate',
        'flicker-l':   'flickerL 4s ease-in-out infinite alternate',
        'flicker-r':   'flickerR 3.5s ease-in-out infinite alternate',
        'rise':        'rise 0.8s ease both',
        'marquee':     'marquee 35s linear infinite',
        'blink':       'blink 1s step-end infinite',
      },
      keyframes: {
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        glowGold: { from: { boxShadow: '0 0 4px rgba(240,180,41,0.2)' }, to: { boxShadow: '0 0 12px rgba(240,180,41,0.5)' } },
        flickerL: { '0%': { opacity: '0.6' }, '40%': { opacity: '1' }, '70%': { opacity: '0.7' }, '100%': { opacity: '0.9' } },
        flickerR: { '0%': { opacity: '0.9' }, '30%': { opacity: '0.5' }, '60%': { opacity: '1' }, '100%': { opacity: '0.7' } },
        rise:     { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        marquee:  { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        blink:    { '50%': { opacity: '0' } },
      },
    },
  },
  plugins: [],
}

export default config
