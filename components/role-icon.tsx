'use client'

import Image from 'next/image'
import { type Role } from '@/lib/services/champion'

interface RoleIconProps {
  role: Role
  size?: number
  className?: string
}

const roleIcons: Record<Role, string> = {
  Top: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png',
  Jungle: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png',
  Mid: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png',
  ADC: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png',
  Support: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png',
}

export function RoleIcon({ role, size = 24, className = '' }: RoleIconProps) {
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      title={role}
    >
      <Image
        src={roleIcons[role]}
        alt={role}
        fill
        className="object-contain"
        sizes={`${size}px`}
      />
    </div>
  )
} 