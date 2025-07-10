// Adventure-style custom icons in sepia tone with hand-drawn aesthetic
export const AdventureIcons = {
  // Core App Icons
  Vault: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M5 10h14l-1-3H6l-1 3zm0 0v8c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-8M9 15h6M12 12v6"
        stroke="#8B4513"
        strokeWidth="2"
        fill="#DEB887"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="10" y="8" width="4" height="3" rx="1" fill="#8B4513" />
    </svg>
  ),

  CompassMap: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M3 6c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6z"
        stroke="#8B4513"
        strokeWidth="2"
        fill="#F5DEB3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="4" stroke="#8B4513" strokeWidth="1.5" fill="none" />
      <path d="M12 8l2 4-4-2-2-4 4 2z" fill="#8B4513" />
    </svg>
  ),

  Lantern: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 2v2m0 16v2M8 6h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z"
        stroke="#8B4513"
        strokeWidth="2"
        fill="#DEB887"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 8v8" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="#FF6B35" opacity="0.7" />
    </svg>
  ),

  TreeGrowth: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 22V12M12 12c-2-2-4-4-4-6 0-2.2 1.8-4 4-4s4 1.8 4 4c0 2-2 4-4 6z"
        stroke="#8B4513"
        strokeWidth="2"
        fill="#90EE90"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 18c-1-1-2-2-2-3 0-1.1.9-2 2-2s2 .9 2 2c0 1-1 2-2 3zM16 18c1-1 2-2 2-3 0-1.1-.9-2-2-2s-2 .9-2 2c0 1 1 2 2 3z"
        stroke="#8B4513"
        strokeWidth="1.5"
        fill="#90EE90"
      />
    </svg>
  ),

  OpenBook: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M2 6c0-1.1.9-2 2-2h5c1.1 0 2 .9 2 2v14l-4-2-4 2V6zM13 6c0-1.1.9-2 2-2h5c1.1 0 2 .9 2 2v14l-4-2-4 2V6z"
        stroke="#8B4513"
        strokeWidth="2"
        fill="#F5DEB3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 8h3M6 12h3M15 8h3M15 12h3" stroke="#8B4513" strokeWidth="1" />
    </svg>
  ),

  Sword: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M6 20L4 22l2-2zM20 4l-8 8-2-2 8-8zM15 9l-3 3M9 15l3-3"
        stroke="#8B4513"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 6l-2-2M8 16l-2 2"
        stroke="#C0C0C0"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),

  Shield: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 2c-4 0-8 1-8 5v6c0 6 8 8 8 8s8-2 8-8V7c0-4-4-5-8-5z"
        stroke="#8B4513"
        strokeWidth="2"
        fill="#DEB887"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 12l3 3 5-5" stroke="#8B4513" strokeWidth="1.5" fill="none" />
    </svg>
  ),

  Potion: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M9 2h6v4l2 2v12c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2V8l2-2V2z"
        stroke="#8B4513"
        strokeWidth="2"
        fill="#DEB887"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 12h10" stroke="#8B4513" strokeWidth="1" />
      <circle cx="10" cy="14" r="1" fill="#FF6B35" />
      <circle cx="14" cy="16" r="1" fill="#FF6B35" />
    </svg>
  ),

  Hourglass: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M6 2h12v4l-4 4 4 4v4H6v-4l4-4-4-4V2z"
        stroke="#8B4513"
        strokeWidth="2"
        fill="#F5DEB3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 8h8M8 16h8M12 12v4" stroke="#DEB887" strokeWidth="1" />
    </svg>
  ),

  Flame: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 2c-2 4-2 8 0 10 2-2 4-4 4-8 0-2-2-2-4-2zM8 14c0-2 2-4 4-4s4 2 4 4c0 3-2 6-4 6s-4-3-4-6z"
        stroke="#8B4513"
        strokeWidth="2"
        fill="#FF6B35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 16c1-1 2-2 2-3s-1-2-2-3" stroke="#FFD700" strokeWidth="1.5" />
    </svg>
  ),

  Compass: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#8B4513"
        strokeWidth="2"
        fill="#F5DEB3"
      />
      <path
        d="M12 3l2 6-6-2-2-6 6 2z"
        fill="#8B4513"
        stroke="#8B4513"
        strokeWidth="1"
      />
      <circle cx="12" cy="12" r="1" fill="#8B4513" />
    </svg>
  ),

  Wizard: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 2l2 6-2 2-2-2 2-6zM12 10c-3 0-5 2-5 5v5h10v-5c0-3-2-5-5-5z"
        stroke="#8B4513"
        strokeWidth="2"
        fill="#DEB887"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="16" r="1" fill="#8B4513" />
      <circle cx="14" cy="16" r="1" fill="#8B4513" />
      <path d="M9 18h6" stroke="#8B4513" strokeWidth="1" />
    </svg>
  )
};