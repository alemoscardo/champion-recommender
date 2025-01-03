'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { championService, type ChampionData, type Role } from '@/lib/services/champion'
import { ChampionCard } from '@/components/champion-card'
import { RoleIcon } from '@/components/role-icon'

interface TeamMember {
  champion: ChampionData
  role: Role
}

interface ChampionSelectModalProps {
  champion: ChampionData
  onSelect: (role: Role) => void
  onCancel: () => void
}

function ChampionSelectModal({ champion, onSelect, onCancel }: ChampionSelectModalProps) {
  const roles: Role[] = ['Top', 'Jungle', 'Mid', 'ADC', 'Support']
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 rounded-lg w-80">
        <h3 className="text-lg font-semibold mb-4">Select role for {champion.name}</h3>
        <div className="grid grid-cols-5 gap-2">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => onSelect(role)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title={role}
            >
              <RoleIcon role={role} size={32} />
            </button>
          ))}
        </div>
        <Button onClick={onCancel} className="w-full mt-4" variant="destructive">
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function ChampionSelect() {
  const [allies, setAllies] = useState<TeamMember[]>([])
  const [enemies, setEnemies] = useState<ChampionData[]>([])
  const [recommendations, setRecommendations] = useState<ChampionData[]>([])
  const [explanations, setExplanations] = useState<string[]>([])
  const [builds, setBuilds] = useState<Array<{
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
  }>>([])
  const [allySearch, setAllySearch] = useState('')
  const [enemySearch, setEnemySearch] = useState('')
  const [allySearchResults, setAllySearchResults] = useState<ChampionData[]>([])
  const [enemySearchResults, setEnemySearchResults] = useState<ChampionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGettingRecommendations, setIsGettingRecommendations] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>('ADC')
  const [pendingAlly, setPendingAlly] = useState<ChampionData | null>(null)
  const [gameVersion, setGameVersion] = useState<string>('')

  useEffect(() => {
    const initChampions = async () => {
      try {
        await championService.initialize()
        setGameVersion(championService.getCurrentVersion())
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize champions:', error)
      }
    }
    initChampions()
  }, [])

  useEffect(() => {
    if (allySearch.trim()) {
      setAllySearchResults(championService.searchChampions(allySearch))
    } else {
      setAllySearchResults([])
    }
  }, [allySearch])

  useEffect(() => {
    if (enemySearch.trim()) {
      setEnemySearchResults(championService.searchChampions(enemySearch))
    } else {
      setEnemySearchResults([])
    }
  }, [enemySearch])

  const handleAddAlly = (champion: ChampionData) => {
    if (allies.length < 5 && !allies.find(a => a.champion.id === champion.id)) {
      setPendingAlly(champion)
      setAllySearch('')
    }
  }

  const handleSelectRole = (role: Role) => {
    if (pendingAlly) {
      setAllies([...allies, { champion: pendingAlly, role }])
      setPendingAlly(null)
    }
  }

  const handleAddEnemy = (champion: ChampionData) => {
    if (enemies.length < 5 && !enemies.find(c => c.id === champion.id)) {
      setEnemies([...enemies, champion])
      setEnemySearch('')
    }
  }

  const handleGetRecommendations = async () => {
    try {
      setError(null)
      setRecommendations([])
      setExplanations([])
      setBuilds([])
      setIsGettingRecommendations(true)

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allies: allies.map(a => ({
            champion: a.champion,
            role: a.role
          })),
          enemies,
          targetRole: selectedRole
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations')
      }

      if (!data.recommendations || !data.explanations || !data.builds) {
        throw new Error('Invalid response format from server')
      }

      setRecommendations(data.recommendations)
      setExplanations(data.explanations)
      setBuilds(data.builds)
    } catch (error) {
      console.error('Error getting recommendations:', error)
      setError(error instanceof Error ? error.message : 'Failed to get recommendations')
    } finally {
      setIsGettingRecommendations(false)
    }
  }

  const roles: Role[] = ['Top', 'Jungle', 'Mid', 'ADC', 'Support']

  if (isLoading) {
    return <div className="text-center">Loading champions...</div>
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-400">
        Game Version: {gameVersion}
      </div>

      {pendingAlly && (
        <ChampionSelectModal
          champion={pendingAlly}
          onSelect={handleSelectRole}
          onCancel={() => setPendingAlly(null)}
        />
      )}

      <div className="flex gap-2 justify-center">
        {roles.map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`p-3 rounded-lg transition-colors ${
              selectedRole === role 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title={role}
          >
            <RoleIcon role={role} size={32} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Ally Team ({allies.length}/5)</h2>
          <div className="space-y-3">
            {allies.map((ally) => (
              <ChampionCard
                key={ally.champion.id}
                champion={ally.champion}
                role={ally.role}
                onRemove={() => setAllies(allies.filter((a) => a.champion.id !== ally.champion.id))}
              />
            ))}
            <div className="relative">
              <Input
                placeholder="Search ally champion..."
                value={allySearch}
                onChange={(e) => setAllySearch(e.target.value)}
                className="mt-2"
              />
              {allySearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
                  {allySearchResults.map((champion) => (
                    <button
                      key={champion.id}
                      className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                      onClick={() => handleAddAlly(champion)}
                      disabled={allies.length >= 5}
                    >
                      <img
                        src={championService.getChampionImageUrl(champion)}
                        alt={champion.name}
                        className="w-8 h-8 rounded"
                      />
                      <span>{champion.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Enemy Team ({enemies.length}/5)</h2>
          <div className="space-y-3">
            {enemies.map((champion) => (
              <ChampionCard
                key={champion.id}
                champion={champion}
                onRemove={() => setEnemies(enemies.filter((c) => c.id !== champion.id))}
              />
            ))}
            <div className="relative">
              <Input
                placeholder="Search enemy champion..."
                value={enemySearch}
                onChange={(e) => setEnemySearch(e.target.value)}
                className="mt-2"
              />
              {enemySearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
                  {enemySearchResults.map((champion) => (
                    <button
                      key={champion.id}
                      className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                      onClick={() => handleAddEnemy(champion)}
                      disabled={enemies.length >= 5}
                    >
                      <img
                        src={championService.getChampionImageUrl(champion)}
                        alt={champion.name}
                        className="w-8 h-8 rounded"
                      />
                      <span>{champion.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recommendations for {selectedRole}</h2>
          {error ? (
            <div className="text-red-500 mb-4">{error}</div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((champion, index) => (
                <ChampionCard
                  key={champion.id}
                  champion={champion}
                  explanation={explanations[index]}
                  showBuild={true}
                  role={selectedRole}
                  build={builds[index] || {
                    items: [],
                    runes: [],
                    summoners: [],
                    skillOrder: []
                  }}
                />
              ))}
              {recommendations.length === 0 && !error && (
                <p className="text-gray-400">No recommendations yet</p>
              )}
            </div>
          )}
          <Button
            className="w-full mt-4"
            onClick={handleGetRecommendations}
            disabled={allies.length === 0 || isGettingRecommendations}
          >
            {isGettingRecommendations ? 'Getting Recommendations...' : 'Get Recommendations'}
          </Button>
        </Card>
      </div>
    </div>
  )
} 