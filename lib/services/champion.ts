interface ChampionData {
  version: string
  id: string
  key: string
  name: string
  title: string
  roles: string[]
  tags: string[]
  image: {
    full: string
    sprite: string
    group: string
  }
  info: {
    attack: number
    defense: number
    magic: number
    difficulty: number
  }
}

interface ChampionsResponse {
  type: string
  format: string
  version: string
  data: Record<string, ChampionData>
}

export type Role = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support'

class ChampionService {
  private static instance: ChampionService
  private champions: ChampionData[] = []
  private version: string = ''

  private constructor() {}

  public static getInstance(): ChampionService {
    if (!ChampionService.instance) {
      ChampionService.instance = new ChampionService()
    }
    return ChampionService.instance
  }

  async initialize(): Promise<void> {
    if (this.champions.length > 0) return

    try {
      // First, fetch the latest version
      const versionResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      const versions = await versionResponse.json()
      this.version = versions[0] // Get the latest version

      // Then fetch champion data
      const response = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${this.version}/data/en_US/champion.json`
      )
      const data: ChampionsResponse = await response.json()
      
      this.champions = Object.values(data.data).map(champion => ({
        ...champion,
        roles: this.getChampionRoles(champion)
      }))
    } catch (error) {
      console.error('Failed to fetch champion data:', error)
      throw error
    }
  }

  private getChampionRoles(champion: ChampionData): Role[] {
    const roleMap: Record<string, Role[]> = {
      Fighter: ['Top', 'Jungle'],
      Tank: ['Top', 'Support'],
      Mage: ['Mid', 'Support'],
      Assassin: ['Mid', 'Jungle'],
      Marksman: ['ADC'],
      Support: ['Support']
    }

    const roles = new Set<Role>()
    champion.tags?.forEach(tag => {
      const mappedRoles = roleMap[tag]
      if (mappedRoles) {
        mappedRoles.forEach(role => roles.add(role))
      }
    })

    return Array.from(roles)
  }

  getChampionImageUrl(champion: ChampionData): string {
    return `https://ddragon.leagueoflegends.com/cdn/${this.version}/img/champion/${champion.image.full}`
  }

  getChampionSplashUrl(champion: ChampionData): string {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`
  }

  searchChampions(query: string, role?: Role): ChampionData[] {
    const normalizedQuery = query.toLowerCase().trim()
    return this.champions.filter(champion =>
      champion.name.toLowerCase().includes(normalizedQuery) &&
      (!role || champion.roles.includes(role))
    )
  }

  getChampionById(id: string): ChampionData | undefined {
    return this.champions.find(champion => champion.id === id)
  }

  getAllChampions(): ChampionData[] {
    return this.champions
  }

  getChampionsByRole(role: Role): ChampionData[] {
    return this.champions.filter(champion => champion.roles.includes(role))
  }

  getDifficultyText(difficulty: number): string {
    if (difficulty <= 3) return 'Easy'
    if (difficulty <= 6) return 'Moderate'
    if (difficulty <= 8) return 'Hard'
    return 'Very Hard'
  }

  getCurrentVersion(): string {
    return this.version
  }
}

export const championService = ChampionService.getInstance()
export type { ChampionData } 