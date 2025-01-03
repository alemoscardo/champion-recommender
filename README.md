# League of Legends Champion Recommender

An AI-powered champion recommendation tool that helps League of Legends players make better decisions during champion select. Using OpenAI's GPT-3.5, it provides intelligent suggestions based on team composition, counters, and meta analysis.

## Features

- Champion recommendations based on team composition and enemy picks
- Role-specific suggestions (Top, Jungle, Mid, ADC, Support)
- Build recommendations including:
  - Optimal runes
  - Item builds
  - Summoner spells
  - Skill order
- Real-time updates during champion select
- Integration with Riot Games Data Dragon API

## Prerequisites

- Node.js 18+
- OpenAI API key
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone https://github.com/alemoscardo/champion-recommender.git
cd champion-recommender
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
```bash
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- Next.js 14
- TypeScript
- OpenAI API
- Tailwind CSS
- Radix UI Components
- Riot Games Data Dragon API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details
