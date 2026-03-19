interface ChannelLogoProps {
  channel: string
  size?: number
}

export default function ChannelLogo({ channel, size = 20 }: ChannelLogoProps) {
  const logos: Record<string, JSX.Element> = {
    'Blinkit': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'inline-block' }}>
        <circle cx="50" cy="50" r="48" fill="#FFD600" />
        <text x="50" y="60" textAnchor="middle" fontSize="48" fontWeight="bold" fill="#000">⚡</text>
      </svg>
    ),
    'Zepto': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'inline-block' }}>
        <rect width="100" height="100" fill="#1C3A70" rx="4" />
        <text x="50" y="65" textAnchor="middle" fontSize="42" fontWeight="bold" fill="#fff">Z</text>
      </svg>
    ),
    'Meta': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'inline-block' }}>
        <rect width="100" height="100" fill="#0A66C2" rx="4" />
        <circle cx="35" cy="40" r="12" fill="#fff" />
        <circle cx="65" cy="40" r="12" fill="#fff" />
        <path d="M 30 60 Q 50 75 70 60" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    ),
    'Google': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'inline-block' }}>
        <rect width="100" height="100" fill="#fff" rx="4" />
        <circle cx="30" cy="30" r="8" fill="#EA4335" />
        <circle cx="50" cy="30" r="8" fill="#FBBC04" />
        <circle cx="70" cy="30" r="8" fill="#34A853" />
        <circle cx="30" cy="50" r="8" fill="#EA4335" />
        <circle cx="50" cy="50" r="8" fill="#FBBC04" />
        <circle cx="70" cy="50" r="8" fill="#34A853" />
        <circle cx="40" cy="70" r="8" fill="#4285F4" />
        <circle cx="60" cy="70" r="8" fill="#EA4335" />
      </svg>
    ),
    'Google Analytics': (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'inline-block' }}>
        <rect width="100" height="100" fill="#F7F7F7" rx="4" />
        <rect x="20" y="60" width="12" height="20" fill="#EA4335" />
        <rect x="35" y="40" width="12" height="40" fill="#FBBC04" />
        <rect x="50" y="50" width="12" height="30" fill="#34A853" />
        <rect x="65" y="35" width="12" height="45" fill="#4285F4" />
      </svg>
    ),
  }

  return logos[channel] || (
    <span style={{ display: 'inline-block', width: size, height: size, background: '#E8E4DE', borderRadius: '4px' }} />
  )
}
