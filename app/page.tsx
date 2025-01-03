import { ChampionSelect } from '@/components/champion-select'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Champion Recommender</h1>
        <ChampionSelect />
      </div>
    </main>
  )
}
