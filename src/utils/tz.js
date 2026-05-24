// Timezone utility — converts UTC timestamps to any IANA-style UTC offset zone

export const TZ_OPTIONS = [
  { label: 'UTC−12:00', value: 'UTC-12', offset: -12 },
  { label: 'UTC−11:00', value: 'UTC-11', offset: -11 },
  { label: 'UTC−10:00 (Hawaii)',         value: 'UTC-10', offset: -10 },
  { label: 'UTC−09:00 (Alaska)',         value: 'UTC-9',  offset: -9  },
  { label: 'UTC−08:00 (Pacific)',        value: 'UTC-8',  offset: -8  },
  { label: 'UTC−07:00 (Mountain)',       value: 'UTC-7',  offset: -7  },
  { label: 'UTC−06:00 (Central)',        value: 'UTC-6',  offset: -6  },
  { label: 'UTC−05:00 (Colombia/EST)',   value: 'UTC-5',  offset: -5  },
  { label: 'UTC−04:00 (Venezuela)',      value: 'UTC-4',  offset: -4  },
  { label: 'UTC−03:00 (Argentina)',      value: 'UTC-3',  offset: -3  },
  { label: 'UTC−02:00',                  value: 'UTC-2',  offset: -2  },
  { label: 'UTC−01:00 (Azores)',         value: 'UTC-1',  offset: -1  },
  { label: 'UTC+00:00 (London)',         value: 'UTC+0',  offset: 0   },
  { label: 'UTC+01:00 (Madrid/Paris)',   value: 'UTC+1',  offset: 1   },
  { label: 'UTC+02:00 (Cairo)',          value: 'UTC+2',  offset: 2   },
  { label: 'UTC+03:00 (Moscú)',          value: 'UTC+3',  offset: 3   },
  { label: 'UTC+04:00 (Dubai)',          value: 'UTC+4',  offset: 4   },
  { label: 'UTC+05:30 (India)',          value: 'UTC+5.5',offset: 5.5 },
  { label: 'UTC+06:00',                  value: 'UTC+6',  offset: 6   },
  { label: 'UTC+07:00 (Bangkok)',        value: 'UTC+7',  offset: 7   },
  { label: 'UTC+08:00 (Beijing)',        value: 'UTC+8',  offset: 8   },
  { label: 'UTC+09:00 (Tokio)',          value: 'UTC+9',  offset: 9   },
  { label: 'UTC+10:00 (Sydney)',         value: 'UTC+10', offset: 10  },
  { label: 'UTC+11:00',                  value: 'UTC+11', offset: 11  },
  { label: 'UTC+12:00 (Auckland)',       value: 'UTC+12', offset: 12  },
]

function parseOffset(tzValue) {
  const match = tzValue.match(/UTC([+-]\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : 0
}

/**
 * Convert a UTC ISO string to the user's timezone.
 * Returns a Date-like object with hours/minutes adjusted.
 */
export function toUserTz(isoString, userTz = 'UTC+0') {
  const utcMs  = new Date(isoString).getTime()
  const offset = parseOffset(userTz)
  return new Date(utcMs + offset * 60 * 60 * 1000)
}

/**
 * Format a UTC ISO string in the user's timezone.
 * @param {string} isoString — UTC ISO date string
 * @param {string} userTz    — e.g. 'UTC-5'
 * @param {object} opts      — Intl.DateTimeFormat options
 */
export function formatInTz(isoString, userTz = 'UTC+0', opts = {}) {
  const local = toUserTz(isoString, userTz)
  return local.toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    ...opts,
  })
}

export function formatDateInTz(isoString, userTz = 'UTC+0') {
  const local = toUserTz(isoString, userTz)
  return local.toLocaleDateString('es-CO', { weekday: 'short', month: 'short', day: 'numeric' })
}
