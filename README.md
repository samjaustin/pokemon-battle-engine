# Pokemon Gen 1 Battle Engine

A comprehensive battle simulation engine for Generation 1 Pokemon (Red/Blue/Yellow), featuring accurate damage calculation, type effectiveness, and a full round-robin tournament system.

![Tournament Results](docs/tournament-results.png)

## Features

- **Complete Gen 1 Pokedex**: All 151 Pokemon with accurate base stats and moves
- **Authentic Gen 1 Mechanics**: 
  - Physical/Special split based on move type (not individual moves)
  - Single Special stat (before Special Attack/Defense split)
  - Original type chart (no Dark/Steel/Fairy types)
- **Smart Move Selection**: Each Pokemon gets their top 3 damaging level-up moves + 1 status move
- **Round-Robin Tournament**: Simulates all 11,325 unique matchups
- **Live Battle Visualization**: Real-time progress tracking with ANSI colors
- **Detailed Rankings**: Win rates, scores, and performance metrics

## Gen 1 Battle Mechanics

### Damage Formula
```
Damage = (((2 × Level / 5 + 2) × Power × (Attack / Defense)) / 50) + 2
```
- Level 100 scaling factor: 42
- Minimum damage floor: +2
- STAB bonus: 1.5× for same-type moves
- Type effectiveness: 2× (super effective), 0.5× (not very effective), 0× (immune)

### Physical vs Special
| Category | Stats Used | Move Types |
|----------|-----------|------------|
| Physical | Attack vs Defense | Normal, Fighting, Flying, Poison, Ground, Rock, Bug, Ghost |
| Special | Special vs Special | Fire, Water, Grass, Electric, Psychic, Ice, Dragon |

### Turn Order
1. Compare Speed stats
2. Higher Speed attacks first
3. Speed ties resolved by coin flip (50/50)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pokemon-gen1-battle-engine.git
cd pokemon-gen1-battle-engine

# Setup (fetch data + calculate stats + create directories)
npm run setup
```

Or step by step:
```bash
# Fetch Pokemon data from PokeAPI
npm run fetch

# Calculate Level 100 stats
npm run calc-stats
```

## Usage

### Run Full Tournament
```bash
npm run tournament
```

Simulates all 11,325 battles between 151 Pokemon and generates rankings.

**Output includes:**
- Live progress bar
- Recent battle log
- Final rankings with medals
- JSON export to `results/tournament-gen1.json`

### Run Single Battle
```bash
npm run battle
```

Edit `battle.js` to test specific matchups:
```javascript
const pokemonA = pokemonDb.find(p => p.name === 'mewtwo');
const pokemonB = pokemonDb.find(p => p.name === 'dragonite');
```

## Sample Results

### Top 15 Pokemon (Tournament Rankings)

| Rank | Pokemon | Wins | Losses | Win Rate | Score |
|------|---------|------|--------|----------|-------|
| 🥇 1 | Mewtwo | 149 | 1 | 99.3% | 446 |
| 🥈 2 | Alakazam | 141 | 9 | 94.0% | 414 |
| 🥉 3 | Mew | 141 | 9 | 94.0% | 414 |
| 4 | Moltres | 139 | 11 | 92.7% | 406 |
| 5 | Vaporeon | 138 | 12 | 92.0% | 402 |

*Score = (Wins × 3) - Losses*

## Project Structure

```
pokemon-gen1-battle-engine/
├── api/
│   └── fetch-data.js          # Fetches 151 Pokemon from PokeAPI
├── data/
│   ├── pokemon-gen1.json      # Pokemon data with stats and moves
│   └── type_effectiveness_gen1.json  # Gen 1 type chart
├── results/
│   └── tournament-gen1.json   # Tournament rankings export
├── battle.js                  # Turn-based battle simulator
├── damage_calculator.js       # Gen 1 damage formula implementation
├── lvl_100.js                 # Level 100 stat calculator
└── tournament_loop.js         # Round-robin tournament engine
```

## Technical Implementation

### Move Extraction
Each Pokemon fetches their learnset and filters for:
- Level-up moves only (no TMs)
- Learned by level 100 or below
- Top 3 damaging moves sorted by power
- 1 status move filler if needed

### Type Compatibility
Modern types not in Gen 1 are mapped:
- Dark → Normal
- Steel → Normal  
- Fairy → Normal

### Battle Safety
100-turn limit prevents infinite loops from type immunity (e.g., Ground vs Flying).

## Contributing

Contributions welcome! Areas for expansion:
- AI move selection strategy
- Status effects (poison, burn, paralysis)
- Critical hit mechanics
- Accuracy/evasion
- Team battles (6v6)

## License

MIT License - Feel free to use for research, education, or fun!

## Acknowledgments

- Data sourced from [PokeAPI](https://pokeapi.co/)
- Inspired by Pokemon Red/Blue/Yellow battle mechanics
- Built for research and educational purposes

---

*Not affiliated with Nintendo, Game Freak, or The Pokemon Company.*
