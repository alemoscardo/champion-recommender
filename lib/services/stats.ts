import { type Role } from './champion'

interface ChampionBuild {
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
  winRate: number
  pickRate: number
  banRate: number
}

interface DeepLolResponse {
  build_by_lane: {
    [key: string]: {
      build_lst: Array<{
        rune: {
          main_build: number[]
          sub_build: number[]
          stat_build: number[]
        }
        item: {
          build: number[]
          detail: number[]
          detail_price: number[]
        }
        spell: {
          build: number[]
        }
        skill: {
          build: number[]
          detail: number[]
        }
        win_rate: number
        pick_rate: number
        games: number
      }>
      champion_tier: number
      win_rate: number
      pick_rate: number
      ban_rate: number
    }
  }
}

export class StatsService {
  private static instance: StatsService

  // Summoner Spell ID to Name mapping
  private summonerSpells: { [key: string]: string } = {
    '1': 'Cleanse',
    '3': 'Exhaust',
    '4': 'Flash',
    '6': 'Ghost',
    '7': 'Heal',
    '11': 'Smite',
    '12': 'Teleport',
    '13': 'Clarity',
    '14': 'Ignite',
    '21': 'Barrier',
    '32': 'Mark'
  }

  // Rune ID to Name mapping
  private runes: { [key: string]: string } = {
    // Precision
    '8000': 'Precision',
    '8005': 'Press the Attack',
    '8008': 'Lethal Tempo',
    '8021': 'Fleet Footwork',
    '8010': 'Conqueror',
    '9101': 'Overheal',
    '9111': 'Triumph',
    '8009': 'Presence of Mind',
    '9104': 'Legend: Alacrity',
    '9105': 'Legend: Tenacity',
    '9103': 'Legend: Bloodline',
    '8014': 'Coup de Grace',
    '8017': 'Cut Down',
    '8299': 'Last Stand',

    // Domination
    '8100': 'Domination',
    '8112': 'Electrocute',
    '8124': 'Predator',
    '8128': 'Dark Harvest',
    '9923': 'Hail of Blades',
    '8126': 'Cheap Shot',
    '8139': 'Taste of Blood',
    '8143': 'Sudden Impact',
    '8136': 'Zombie Ward',
    '8120': 'Ghost Poro',
    '8138': 'Eyeball Collection',
    '8135': 'Treasure Hunter',
    '8134': 'Ingenious Hunter',
    '8105': 'Relentless Hunter',
    '8106': 'Ultimate Hunter',

    // Sorcery
    '8200': 'Sorcery',
    '8214': 'Summon Aery',
    '8229': 'Arcane Comet',
    '8230': 'Phase Rush',
    '8224': 'Nullifying Orb',
    '8226': 'Manaflow Band',
    '8275': 'Nimbus Cloak',
    '8210': 'Transcendence',
    '8234': 'Celerity',
    '8233': 'Absolute Focus',
    '8237': 'Scorch',
    '8232': 'Waterwalking',
    '8236': 'Gathering Storm',

    // Resolve
    '8400': 'Resolve',
    '8437': 'Grasp of the Undying',
    '8439': 'Aftershock',
    '8465': 'Guardian',
    '8446': 'Demolish',
    '8463': 'Font of Life',
    '8401': 'Shield Bash',
    '8429': 'Conditioning',
    '8444': 'Second Wind',
    '8473': 'Bone Plating',
    '8451': 'Overgrowth',
    '8453': 'Revitalize',
    '8242': 'Unflinching',

    // Inspiration
    '8300': 'Inspiration',
    '8351': 'Styles/Inspiration/GlacialAugment/GlacialAugment.png',
    '8360': 'Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png',
    '8369': 'Styles/Inspiration/FirstStrike/FirstStrike.png',
    '8306': 'Styles/Inspiration/HextechFlashtraption/HextechFlashtraption.png',
    '8304': 'Styles/Inspiration/MagicalFootwear/MagicalFootwear.png',
    '8313': 'Styles/Inspiration/PerfectTiming/PerfectTiming.png',
    '8321': 'Styles/Inspiration/FuturesMarket/FuturesMarket.png',
    '8316': 'Styles/Inspiration/MinionDematerializer/MinionDematerializer.png',
    '8345': 'Styles/Inspiration/BiscuitDelivery/BiscuitDelivery.png',
    '8347': 'Styles/Inspiration/CosmicInsight/CosmicInsight.png',
    '8410': 'Styles/Inspiration/Approach/Approach.png',
    '8352': 'Styles/Inspiration/TimeWarpTonic/TimeWarpTonic.png',

    // Stat Shards
    '5001': '+8 Ability Haste',
    '5002': '+9 Adaptive Force',
    '5003': '+8% Attack Speed',
    '5005': '+6 Armor',
    '5007': '+8 Magic Resist',
    '5008': '+15-140 Health (based on level)'
  }

  // Complete item ID to Name mapping
  private items: { [key: string]: string } = {
    // Mythic Items
    '6653': "Liandry's Anguish",
    '6655': "Luden's Tempest",
    '6656': 'Everfrost',
    '6657': 'Rod of Ages',
    '6662': 'Iceborn Gauntlet',
    '6664': 'Turbo Chemtank',
    '6665': "Jak'Sho, The Protean",
    '6667': 'Radiant Virtue',
    '6671': 'Galeforce',
    '6672': 'Kraken Slayer',
    '6673': 'Immortal Shieldbow',
    '6691': 'Duskblade of Draktharr',
    '6692': 'Eclipse',
    '6693': "Prowler's Claw",
    '3001': 'Evenshroud',
    '6632': 'Divine Sunderer',
    '6630': 'Goredrinker',
    '6631': 'Stridebreaker',
    '3152': 'Hextech Rocketbelt',
    '4644': 'Crown of the Shattered Queen',
    '6617': 'Moonstone Renewer',
    '6620': 'Shurelya\'s Battlesong',
    '4005': 'Imperial Mandate',

    // Legendary Items
    '3003': "Archangel's Staff",
    '3004': 'Manamune',
    '3011': 'Chemtech Putrifier',
    '3026': 'Guardian Angel',
    '3031': 'Infinity Edge',
    '3033': 'Mortal Reminder',
    '3036': "Lord Dominik's Regards",
    '3041': "Mejai's Soulstealer",
    '3046': 'Phantom Dancer',
    '3050': "Zeke's Convergence",
    '3053': "Sterak's Gage",
    '3065': 'Spirit Visage',
    '3071': 'Black Cleaver',
    '3072': 'Bloodthirster',
    '3074': 'Ravenous Hydra',
    '3075': 'Thornmail',
    '3083': "Warmog's Armor",
    '3085': "Runaan's Hurricane",
    '3089': "Rabadon's Deathcap",
    '3091': "Wit's End",
    '3094': 'Rapid Firecannon',
    '3095': 'Stormrazor',
    '3100': 'Lich Bane',
    '3102': "Banshee's Veil",
    '3107': 'Redemption',
    '3109': "Knight's Vow",
    '3110': 'Frozen Heart',
    '3115': "Nashor's Tooth",
    '3116': "Rylai's Crystal Scepter",
    '3119': "Winter's Approach",
    '3121': 'Fimbulwinter',
    '3124': "Guinsoo's Rageblade",
    '3135': 'Void Staff',
    '3139': 'Mercurial Scimitar',
    '3142': "Youmuu's Ghostblade",
    '3143': "Randuin's Omen",
    '3153': 'Blade of the Ruined King',
    '3156': 'Maw of Malmortius',
    '3157': "Zhonya's Hourglass",
    '3165': 'Morellonomicon',
    '3179': 'Umbral Glaive',
    '3181': 'Hullbreaker',
    '3190': 'Locket of the Iron Solari',
    '3193': "Gargoyle's Stoneplate",
    '3222': "Mikael's Blessing",
    '3504': 'Ardent Censer',
    '3508': 'Essence Reaver',
    '3742': "Dead Man's Plate",
    '3748': 'Titanic Hydra',
    '3814': 'Edge of Night',
    '4401': 'Force of Nature',
    '4628': 'Horizon Focus',
    '4629': 'Cosmic Drive',
    '4637': 'Demonic Embrace',
    '4645': 'Shadowflame',
    '6035': 'Silvermere Dawn',
    '6333': "Death's Dance",
    '6675': 'Navori Quickblades',
    '6676': 'The Collector',
    '6694': "Serylda's Grudge",
    '6695': "Serpent's Fang",
    '6696': 'Axiom Arc',

    // Boots
    '3006': 'Berserker\'s Greaves',
    '3009': 'Boots of Swiftness',
    '3020': 'Sorcerer\'s Shoes',
    '3047': 'Plated Steelcaps',
    '3111': "Mercury's Treads",
    '3117': 'Mobility Boots',
    '3158': 'Ionian Boots of Lucidity',

    // Starting Items
    '1054': "Doran's Shield",
    '1055': "Doran's Blade",
    '1056': "Doran's Ring",
    '1083': 'Cull',
    '1101': 'Scorchclaw Pup',
    '1102': 'Gustwalker Hatchling',
    '1103': 'Mosstomper Seedling',
    '1104': "Steel Sigil",
    '2003': 'Health Potion',
    '2031': 'Refillable Potion',
    '2033': 'Corrupting Potion',
    '3070': 'Tear of the Goddess',
    '3112': "Guardian's Orb",
    '3113': "Aether Wisp",
    '3114': 'Forbidden Idol',
    '3145': 'Hextech Alternator',
    '3802': "Lost Chapter"
  }

  private championIds: { [key: string]: number } = {
    'Aatrox': 266,
    'Ahri': 103,
    'Akali': 84,
    'Akshan': 166,
    'Alistar': 12,
    'Amumu': 32,
    'Anivia': 34,
    'Annie': 1,
    'Aphelios': 523,
    'Ashe': 22,
    'AurelionSol': 136,
    'Azir': 268,
    'Bard': 432,
    'Belveth': 200,
    'Blitzcrank': 53,
    'Brand': 63,
    'Braum': 201,
    'Briar': 233,
    'Caitlyn': 51,
    'Camille': 164,
    'Cassiopeia': 69,
    'Chogath': 31,
    'Corki': 42,
    'Darius': 122,
    'Diana': 131,
    'Draven': 119,
    'DrMundo': 36,
    'Ekko': 245,
    'Elise': 60,
    'Evelynn': 28,
    'Ezreal': 81,
    'Fiddlesticks': 9,
    'Fiora': 114,
    'Fizz': 105,
    'Galio': 3,
    'Gangplank': 41,
    'Garen': 86,
    'Gnar': 150,
    'Gragas': 79,
    'Graves': 104,
    'Gwen': 887,
    'Hecarim': 120,
    'Heimerdinger': 74,
    'Illaoi': 420,
    'Irelia': 39,
    'Ivern': 427,
    'Janna': 40,
    'JarvanIV': 59,
    'Jax': 24,
    'Jayce': 126,
    'Jhin': 202,
    'Jinx': 222,
    'Kaisa': 145,
    'Kalista': 429,
    'Karma': 43,
    'Karthus': 30,
    'Kassadin': 38,
    'Katarina': 55,
    'Kayle': 10,
    'Kayn': 141,
    'Kennen': 85,
    'Khazix': 121,
    'Kindred': 203,
    'Kled': 240,
    'KogMaw': 96,
    'KSante': 897,
    'Leblanc': 7,
    'LeeSin': 64,
    'Leona': 89,
    'Lillia': 876,
    'Lissandra': 127,
    'Lucian': 236,
    'Lulu': 117,
    'Lux': 99,
    'Malphite': 54,
    'Malzahar': 90,
    'Maokai': 57,
    'MasterYi': 11,
    'MissFortune': 21,
    'MonkeyKing': 62,
    'Mordekaiser': 82,
    'Morgana': 25,
    'Naafiri': 950,
    'Nami': 267,
    'Nasus': 75,
    'Nautilus': 111,
    'Neeko': 518,
    'Nidalee': 76,
    'Nilah': 895,
    'Nocturne': 56,
    'Nunu': 20,
    'Olaf': 2,
    'Orianna': 61,
    'Ornn': 516,
    'Pantheon': 80,
    'Poppy': 78,
    'Pyke': 555,
    'Qiyana': 246,
    'Quinn': 133,
    'Rakan': 497,
    'Rammus': 33,
    'RekSai': 421,
    'Rell': 526,
    'Renata': 888,
    'Renekton': 58,
    'Rengar': 107,
    'Riven': 92,
    'Rumble': 68,
    'Ryze': 13,
    'Samira': 360,
    'Sejuani': 113,
    'Senna': 235,
    'Seraphine': 147,
    'Sett': 875,
    'Shaco': 35,
    'Shen': 98,
    'Shyvana': 102,
    'Singed': 27,
    'Sion': 14,
    'Sivir': 15,
    'Skarner': 72,
    'Sona': 37,
    'Soraka': 16,
    'Swain': 50,
    'Sylas': 517,
    'Syndra': 134,
    'TahmKench': 223,
    'Taliyah': 163,
    'Talon': 91,
    'Taric': 44,
    'Teemo': 17,
    'Thresh': 412,
    'Tristana': 18,
    'Trundle': 48,
    'Tryndamere': 23,
    'TwistedFate': 4,
    'Twitch': 29,
    'Udyr': 77,
    'Urgot': 6,
    'Varus': 110,
    'Vayne': 67,
    'Veigar': 45,
    'Velkoz': 161,
    'Vex': 711,
    'Vi': 254,
    'Viego': 234,
    'Viktor': 112,
    'Vladimir': 8,
    'Volibear': 106,
    'Warwick': 19,
    'Xayah': 498,
    'Xerath': 101,
    'XinZhao': 5,
    'Yasuo': 157,
    'Yone': 777,
    'Yorick': 83,
    'Yuumi': 350,
    'Zac': 154,
    'Zed': 238,
    'Zeri': 221,
    'Ziggs': 115,
    'Zilean': 26,
    'Zoe': 142,
    'Zyra': 143
  }

  private constructor() {}

  public static getInstance(): StatsService {
    if (!StatsService.instance) {
      StatsService.instance = new StatsService()
    }
    return StatsService.instance
  }

  private convertRoleToDeepLol(role: Role): string {
    const roleMap: { [key: string]: string } = {
      'Top': 'Top',
      'Jungle': 'Jungle',
      'Mid': 'Middle',
      'ADC': 'Bot',
      'Support': 'Supporter'
    }
    return roleMap[role] || role
  }

  private getItemName(id: string): string {
    return this.items[id] || `Item ${id}`
  }

  private getRuneName(id: string): string {
    return this.runes[id] || `Rune ${id}`
  }

  private getSummonerSpellName(id: string): string {
    return this.summonerSpells[id] || `Spell ${id}`
  }

  private getItemIconUrl(id: string): string {
    return `https://ddragon.leagueoflegends.com/cdn/14.3.1/img/item/${id}.png`
  }

  private getRuneIconUrl(id: string): string {
    if (!id) return ''

    // For stat shards
    const statMap: { [key: string]: string } = {
      '5011': 'a/a3/Rune_shard_Adaptive_Force.png',
      '5002': '5/56/Rune_shard_Armor.png',
      '5003': '3/3f/Rune_shard_Magic_Resist.png',
      '5008': '7/7a/Rune_shard_Health.png',
      '5007': '8/8b/Rune_shard_CDR.png',
      '5005': '0/0f/Rune_shard_Attack_Speed.png'
    }

    const baseUrl = 'https://static.wikia.nocookie.net/leagueoflegends/images'

    // For stat shards
    if (statMap[id]) {
      return `${baseUrl}/${statMap[id]}/revision/latest/scale-to-width-down/30?cb=20181122101607`
    }

    // For main tree runes and other runes, keep using Data Dragon
    const ddragonBaseUrl = 'https://ddragon.leagueoflegends.com/cdn/img/perk-images'

    // For main tree runes (keystones)
    const mainTreeMap: { [key: string]: string } = {
      '8000': 'Styles/7201_Precision.png',
      '8100': 'Styles/7200_Domination.png',
      '8200': 'Styles/7202_Sorcery.png',
      '8400': 'Styles/7204_Resolve.png',
      '8300': 'Styles/7203_Whimsy.png'
    }

    if (mainTreeMap[id]) {
      return `${ddragonBaseUrl}/${mainTreeMap[id]}`
    }

    // For keystones and minor runes
    const runeMap: { [key: string]: string } = {
      // Precision
      '8005': 'Styles/Precision/PressTheAttack/PressTheAttack.png',
      '8008': 'Styles/Precision/LethalTempo/LethalTempoTemp.png',
      '8021': 'Styles/Precision/FleetFootwork/FleetFootwork.png',
      '8010': 'Styles/Precision/Conqueror/Conqueror.png',
      '9101': 'Styles/Precision/Overheal.png',
      '9111': 'Styles/Precision/Triumph.png',
      '8009': 'Styles/Precision/PresenceOfMind/PresenceOfMind.png',
      '9104': 'Styles/Precision/LegendAlacrity/LegendAlacrity.png',
      '9105': 'Styles/Precision/LegendTenacity/LegendTenacity.png',
      '9103': 'Styles/Precision/LegendBloodline/LegendBloodline.png',
      '8014': 'Styles/Precision/CoupDeGrace/CoupDeGrace.png',
      '8017': 'Styles/Precision/CutDown/CutDown.png',
      '8299': 'Styles/Precision/LastStand/LastStand.png',

      // Domination
      '8112': 'Styles/Domination/Electrocute/Electrocute.png',
      '8124': 'Styles/Domination/Predator/Predator.png',
      '8128': 'Styles/Domination/DarkHarvest/DarkHarvest.png',
      '9923': 'Styles/Domination/HailOfBlades/HailOfBlades.png',
      '8126': 'Styles/Domination/CheapShot/CheapShot.png',
      '8139': 'Styles/Domination/TasteOfBlood/TasteOfBlood.png',
      '8143': 'Styles/Domination/SuddenImpact/SuddenImpact.png',
      '8136': 'Styles/Domination/ZombieWard/ZombieWard.png',
      '8120': 'Styles/Domination/GhostPoro/GhostPoro.png',
      '8138': 'Styles/Domination/EyeballCollection/EyeballCollection.png',
      '8135': 'Styles/Domination/TreasureHunter/TreasureHunter.png',
      '8134': 'Styles/Domination/IngeniousHunter/IngeniousHunter.png',
      '8105': 'Styles/Domination/RelentlessHunter/RelentlessHunter.png',
      '8106': 'Styles/Domination/UltimateHunter/UltimateHunter.png',

      // Sorcery
      '8214': 'Styles/Sorcery/SummonAery/SummonAery.png',
      '8229': 'Styles/Sorcery/ArcaneComet/ArcaneComet.png',
      '8230': 'Styles/Sorcery/PhaseRush/PhaseRush.png',
      '8224': 'Styles/Sorcery/NullifyingOrb/NullifyingOrb.png',
      '8226': 'Styles/Sorcery/ManaflowBand/ManaflowBand.png',
      '8275': 'Styles/Sorcery/NimbusCloak/NimbusCloak.png',
      '8210': 'Styles/Sorcery/Transcendence/Transcendence.png',
      '8234': 'Styles/Sorcery/Celerity/Celerity.png',
      '8233': 'Styles/Sorcery/AbsoluteFocus/AbsoluteFocus.png',
      '8237': 'Styles/Sorcery/Scorch/Scorch.png',
      '8232': 'Styles/Sorcery/Waterwalking/Waterwalking.png',
      '8236': 'Styles/Sorcery/GatheringStorm/GatheringStorm.png',

      // Resolve
      '8437': 'Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png',
      '8439': 'Styles/Resolve/VeteranAftershock/VeteranAftershock.png',
      '8465': 'Styles/Resolve/Guardian/Guardian.png',
      '8446': 'Styles/Resolve/Demolish/Demolish.png',
      '8463': 'Styles/Resolve/FontOfLife/FontOfLife.png',
      '8401': 'Styles/Resolve/MirrorShell/MirrorShell.png',
      '8429': 'Styles/Resolve/Conditioning/Conditioning.png',
      '8444': 'Styles/Resolve/SecondWind/SecondWind.png',
      '8473': 'Styles/Resolve/BonePlating/BonePlating.png',
      '8451': 'Styles/Resolve/Overgrowth/Overgrowth.png',
      '8453': 'Styles/Resolve/Revitalize/Revitalize.png',
      '8242': 'Styles/Resolve/Unflinching/Unflinching.png',

      // Inspiration
      '8351': 'Styles/Inspiration/GlacialAugment/GlacialAugment.png',
      '8360': 'Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png',
      '8369': 'Styles/Inspiration/FirstStrike/FirstStrike.png',
      '8306': 'Styles/Inspiration/HextechFlashtraption/HextechFlashtraption.png',
      '8304': 'Styles/Inspiration/MagicalFootwear/MagicalFootwear.png',
      '8313': 'Styles/Inspiration/PerfectTiming/PerfectTiming.png',
      '8321': 'Styles/Inspiration/FuturesMarket/FuturesMarket.png',
      '8316': 'Styles/Inspiration/MinionDematerializer/MinionDematerializer.png',
      '8345': 'Styles/Inspiration/BiscuitDelivery/BiscuitDelivery.png',
      '8347': 'Styles/Inspiration/CosmicInsight/CosmicInsight.png',
      '8410': 'Styles/Inspiration/Approach/Approach.png',
      '8352': 'Styles/Inspiration/TimeWarpTonic/TimeWarpTonic.png'
    }

    if (runeMap[id]) {
      return `${ddragonBaseUrl}/${runeMap[id]}`
    }

    return ''
  }

  private getSummonerSpellIconUrl(id: string): string {
    const spellMap: { [key: string]: string } = {
      '1': 'SummonerBoost',      // Cleanse
      '3': 'SummonerExhaust',    // Exhaust
      '4': 'SummonerFlash',      // Flash
      '6': 'SummonerHaste',      // Ghost
      '7': 'SummonerHeal',       // Heal
      '11': 'SummonerSmite',     // Smite
      '12': 'SummonerTeleport',  // Teleport
      '13': 'SummonerMana',      // Clarity
      '14': 'SummonerDot',       // Ignite
      '21': 'SummonerBarrier',   // Barrier
      '32': 'SummonerSnowball'   // Mark
    }
    const spellName = spellMap[id] || id
    return `https://ddragon.leagueoflegends.com/cdn/14.3.1/img/spell/${spellName}.png`
  }

  private getSkillIconUrl(championId: number, skill: number): string {
    const championName = Object.entries(this.championIds)
      .find(([, id]) => id === championId)?.[0]
    
    if (!championName) return ''

    // Convert champion name to the format used in Data Dragon
    const formattedChampName = championName
      .replace(/[^a-zA-Z]/g, '') // Remove special characters
      .replace(/([A-Z])/g, (match) => match.toLowerCase()) // Convert to lowercase
      .replace(/^(w)uk(ong)$/, 'monkeyking') // Special case for Wukong
      .replace(/^(nunu).*$/, 'nunu') // Special case for Nunu & Willump
      .replace(/^(renata).*$/, 'renata') // Special case for Renata Glasc
      .replace(/^(k)aisa$/, 'kaisa') // Special case for Kai'Sa
      .replace(/^(k)hazix$/, 'khazix') // Special case for Kha'Zix
      .replace(/^(k)ogmaw$/, 'kogmaw') // Special case for Kog'Maw
      .replace(/^(r)ekSai$/, 'reksai') // Special case for Rek'Sai
      .replace(/^(b)elveth$/, 'belveth') // Special case for Bel'Veth
      .replace(/^(b)ard$/, 'bard')
      .replace(/^(c)hoGath$/, 'chogath')
      .replace(/^(d)rMundo$/, 'drmundo')
      .replace(/^(l)eeSin$/, 'leesin')
      .replace(/^(m)asterYi$/, 'masteryi')
      .replace(/^(m)issFortune$/, 'missfortune')
      .replace(/^(t)ahmKench$/, 'tahmkench')
      .replace(/^(t)wistedFate$/, 'twistedfate')
      .replace(/^(x)inZhao$/, 'xinzhao')

    const skillMap = {
      1: 'Q',
      2: 'W',
      3: 'E'
    }

    return `https://ddragon.leagueoflegends.com/cdn/14.3.1/img/spell/${formattedChampName}${skillMap[skill as keyof typeof skillMap]}.png`
  }

  public async getChampionBuild(championName: string, role: Role): Promise<ChampionBuild> {
    try {
      // Remove special characters and spaces from champion name
      const normalizedChampionName = championName.replace(/[^a-zA-Z]/g, '')
      let championId = this.championIds[normalizedChampionName]
      if (!championId) {
        // Try to find the champion ID by matching case-insensitive and ignoring special characters
        const championEntry = Object.entries(this.championIds).find(([name]) => 
          name.toLowerCase().replace(/[^a-zA-Z]/g, '') === championName.toLowerCase().replace(/[^a-zA-Z]/g, '')
        )
        if (!championEntry) {
          throw new Error(`Champion ID not found for ${championName}`)
        }
        championId = championEntry[1]
      }

      const deepLolRole = this.convertRoleToDeepLol(role)
      const response = await fetch(
        `https://b2c-api-cdn.deeplol.gg/champion/build?platform_id=KR&champion_id=${championId}&game_version=14.24&tier=Emerald%2B`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch build data: ${response.statusText}`)
      }

      const data: DeepLolResponse = await response.json()
      const roleBuild = data.build_by_lane[deepLolRole]

      if (!roleBuild || !roleBuild.build_lst.length) {
        throw new Error(`No build data found for ${championName} ${role}`)
      }

      const bestBuild = roleBuild.build_lst.reduce((prev, current) => 
        (current.win_rate > prev.win_rate) ? current : prev
      )

      // Convert skill order to priorities (excluding R)
      const skillCounts = new Map<number, number>()
      bestBuild.skill.detail.forEach((skill, index) => {
        if (index < 18 && skill !== 4) { // Only count first 18 levels and exclude R
          skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1)
        }
      })

      // Sort skills by priority (number of times maxed first)
      const skillOrder = Array.from(skillCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([skill]) => ['Q', 'W', 'E'][skill - 1])
        .filter(skill => skill)

      // Map stat shards to their correct IDs
      const statShardMap: { [key: number]: string } = {
        0: '5011', // Adaptive Force
        1: '5002', // Armor
        2: '5003', // Magic Resist
        3: '5008', // Health
        4: '5007', // CDR
        5: '5005'  // Attack Speed
      }

      return {
        items: bestBuild.item.build.map(id => ({
          id: String(id),
          name: this.getItemName(String(id)),
          iconUrl: this.getItemIconUrl(String(id))
        })),
        runes: [
          ...bestBuild.rune.main_build.map(id => ({
            id: String(id),
            name: this.getRuneName(String(id)),
            iconUrl: this.getRuneIconUrl(String(id))
          })),
          ...bestBuild.rune.sub_build.map(id => ({
            id: String(id),
            name: this.getRuneName(String(id)),
            iconUrl: this.getRuneIconUrl(String(id))
          })),
          ...bestBuild.rune.stat_build.map(id => ({
            id: statShardMap[id],
            name: this.getRuneName(statShardMap[id]),
            iconUrl: this.getRuneIconUrl(statShardMap[id])
          }))
        ],
        summoners: bestBuild.spell.build.map(id => ({
          id: String(id),
          name: this.getSummonerSpellName(String(id)),
          iconUrl: this.getSummonerSpellIconUrl(String(id))
        })),
        skillOrder: skillOrder.map(skill => ({
          id: 0,
          name: skill,
          iconUrl: ''
        })),
        winRate: bestBuild.win_rate,
        pickRate: bestBuild.pick_rate,
        banRate: roleBuild.ban_rate || 0
      }
    } catch (error) {
      console.error(`Error getting champion build for ${championName}:`, error)
      return {
        items: [{ id: '0', name: 'Error loading items', iconUrl: '' }],
        runes: [{ id: '0', name: 'Error loading runes', iconUrl: '' }],
        summoners: role === 'Jungle' 
          ? [
              { id: '11', name: 'Smite', iconUrl: this.getSummonerSpellIconUrl('11') },
              { id: '4', name: 'Flash', iconUrl: this.getSummonerSpellIconUrl('4') }
            ]
          : [
              { id: '4', name: 'Flash', iconUrl: this.getSummonerSpellIconUrl('4') },
              { id: '14', name: 'Ignite', iconUrl: this.getSummonerSpellIconUrl('14') }
            ],
        skillOrder: [
          { id: 0, name: 'Q', iconUrl: '' },
          { id: 0, name: 'W', iconUrl: '' },
          { id: 0, name: 'E', iconUrl: '' }
        ],
        winRate: 0,
        pickRate: 0,
        banRate: 0
      }
    }
  }
}

export const statsService = StatsService.getInstance() 