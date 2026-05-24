/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{jsx,tsx,js,ts}', './index.html'],
  corePlugins: {
    preflight: false, // avoid resetting base styles set by globals.css
  },
  theme: {
    extend: {
      colors: {
        paper:  'var(--paper)',
        paper2: 'var(--paper-2)',
        ink:    'var(--ink)',
        ink2:   'var(--ink-2)',
        muted:  'var(--muted)',
        'gc-green':     'var(--green)',
        'gc-green-ink': 'var(--green-ink)',
        'gc-red':       'var(--red)',
        'gc-red-ink':   'var(--red-ink)',
        'gc-gold':      'var(--gold)',
        'gc-gold-ink':  'var(--gold-ink)',
        'gc-sky':       'var(--sky)',
      },
      fontFamily: {
        display: 'var(--f-display)',
        sub:     'var(--f-sub)',
        body:    'var(--f-body)',
        mono:    'var(--f-mono)',
      },
      borderColor: {
        rule:        'var(--rule)',
        'rule-strong': 'var(--rule-strong)',
      },
      borderRadius: {
        xs: 'var(--r-xs)',
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
      },
      boxShadow: {
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)',
      },
      spacing: {
        pad: 'var(--pad)',
        gap: 'var(--gap)',
      },
    },
  },
  plugins: [],
}
