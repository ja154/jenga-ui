tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        error: 'var(--error)',
        
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'bg-quaternary': 'var(--bg-quaternary)',
        'bg-quinary': 'var(--bg-quinary)',
        'bg-senary': 'var(--bg-senary)',
        'bg-septenary': 'var(--bg-septenary)',
        'bg-octonary': 'var(--bg-octonary)',
        
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-quaternary': 'var(--text-quaternary)',
        'text-quinary': 'var(--text-quinary)',
        'text-senary': 'var(--text-senary)',
        
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'border-tertiary': 'var(--border-tertiary)',
        
        'glass-bg-primary': 'var(--glass-bg-primary)',
        'glass-bg-secondary': 'var(--glass-bg-secondary)',
        'glass-border-primary': 'var(--glass-border-primary)',

        'selection-bg': 'var(--selection-bg)',
        'selection-text': 'var(--selection-text)',
        'tooltip-bg': 'var(--tooltip-bg)',
        'tooltip-text': 'var(--tooltip-text)',
        'tooltip-border': 'var(--tooltip-border)',
      },
      fontFamily: {
        sans: ['"Google Sans Display"', 'sans-serif'],
        mono: ['"Google Sans Mono"', 'monospace'],
      },
      keyframes: {
        gradientFlow: {
          '0%': { 'background-position': '0% 0%' },
          '100%': { 'background-position': '0% 300%' },
        },
        gradientAnimation: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%': { transform: 'translateY(-2px)' },
          '50%': { transform: 'translateY(1px)' },
          '100%': { transform: 'translateY(-2px)' },
        },
        spin: {
          '0%, 20%': { transform: 'rotate(0)' },
          '80%, 100%': { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%': { 'box-shadow': '0 0 0 0 rgba(239, 83, 80, 0.7)' },
          '70%': { 'box-shadow': '0 0 0 10px rgba(239, 83, 80, 0)' },
          '100%': { 'box-shadow': '0 0 0 0 rgba(239, 83, 80, 0)' },
        }
      },
      animation: {
        gradientFlow: 'gradientFlow 10s ease infinite alternate',
        gradientAnimation: 'gradient-animation 15s ease infinite',
        fadeInUp: 'fadeInUp 0.5s ease-out',
        fadeIn: 'fadeIn 0.5s ease-out',
        float: 'float 2s ease-in-out infinite',
        spin: 'spin 1.2s infinite ease-in-out',
        pulse: 'pulse 1.5s infinite',
      },
    },
  },
  plugins: [],
};