'use client'

import { ChampionData, championService, type Role } from '@/lib/services/champion'
import { Button } from './ui/button'
import { X } from 'lucide-react'

interface ChampionCardProps {
  champion: ChampionData
  explanation?: string
  onRemove?: () => void
  showStats?: boolean
  showBuild?: boolean
  role?: Role
  build?: {
    items: Array<{
      id: string
      name: string
      iconUrl: string
    }>
    runes: Array<{
      id: string
      name: string
      iconUrl: string
    }>
    summoners: Array<{
      id: string
      name: string
      iconUrl: string
    }>
    skillOrder: Array<{
      id: number
      name: string
      iconUrl: string
    }>
  }
}

export function ChampionCard({
  champion,
  explanation,
  onRemove,
  showStats,
  role,
  build
}: ChampionCardProps) {
  return (
    <div className="relative rounded-lg bg-gray-800 p-4 shadow">
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-5 w-5"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <div className="flex items-start space-x-4">
        <img
          src={championService.getChampionImageUrl(champion)}
          alt={champion.name}
          className="h-16 w-16 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-white">{champion.name}</h3>
          <p className="text-sm text-gray-400">{champion.title}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {role ? (
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-xs font-medium text-blue-200">
                {role}
              </span>
            ) : (
              champion.roles.map((role) => (
                <span
                  key={role}
                  className="rounded bg-blue-500/20 px-1.5 py-0.5 text-xs font-medium text-blue-200"
                >
                  {role}
                </span>
              ))
            )}
          </div>
          {explanation && (
            <p className="mt-2 text-sm text-gray-400">{explanation}</p>
          )}
          {build && (
            <div className="mt-3 space-y-2">
              <div className="text-sm text-gray-300">
                <span className="font-medium text-white">Build: </span>
                <div className="flex gap-1 mt-1">
                  {build.items.map((item, i) => (
                    <img
                      key={i}
                      src={item.iconUrl}
                      alt={item.name}
                      title={item.name}
                      className="w-8 h-8 rounded"
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-300">
                <span className="font-medium text-white">Runes: </span>
                <div className="flex gap-1 mt-1">
                  {build.runes.map((rune, i) => (
                    <img
                      key={i}
                      src={rune.iconUrl}
                      alt={rune.name}
                      title={rune.name}
                      className="w-6 h-6 rounded"
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-300">
                <span className="font-medium text-white">Summoners: </span>
                <div className="flex gap-1 mt-1">
                  {build.summoners.map((spell, i) => (
                    <img
                      key={i}
                      src={spell.iconUrl}
                      alt={spell.name}
                      title={spell.name}
                      className="w-6 h-6 rounded"
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-300">
                <span className="font-medium text-white">Skill Priority: </span>
                <div className="flex gap-1 mt-1">
                  {build.skillOrder.map((skill, i) => (
                    <img
                      key={i}
                      src={skill.iconUrl}
                      alt={skill.name}
                      title={skill.name}
                      className="w-6 h-6 rounded"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 