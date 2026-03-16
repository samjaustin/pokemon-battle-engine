// Tournament Loop - Round-robin battle tournament with live display
const fs = require('fs')
const { simulateBattle } = require('./battle')

const rawData = fs.readFileSync('data/pokemon-gen1.json')
const pokemonDb = JSON.parse(rawData)

// Color codes
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const CYAN = '\x1b[36m'
const YELLOW = '\x1b[33m'
const MAGENTA = '\x1b[35m'
const RESET = '\x1b[0m'
const CLEAR = '\x1b[2J'
const HOME = '\x1b[H'

// Initialize scoreboard
let scoreboard = {}
pokemonDb.forEach(p => scoreboard[p.name] = { wins: 0, losses: 0 })

const totalBattles = (pokemonDb.length * (pokemonDb.length - 1)) / 2
let currentBattle = 0
let recentBattles = [] // Store last 15 battles for display

function drawScreen() {
  // Clear screen and move to top
  process.stdout.write(CLEAR + HOME)
  
  // Header
  console.log(`${CYAN}╔════════════════════════════════════════════════════════════════╗${RESET}`)
  console.log(`${CYAN}║           POKEMON GEN 1 TOURNAMENT - ROUND ROBIN               ║${RESET}`)
  console.log(`${CYAN}╚════════════════════════════════════════════════════════════════╝${RESET}`)
  console.log(`${YELLOW}  Pokemon: ${pokemonDb.length}  |  Total Battles: ${totalBattles}  |  Current: ${currentBattle}${RESET}`)
  console.log('')
  
  // Recent battles log (last 15)
  console.log(`${MAGENTA}  ── RECENT BATTLES ──${RESET}`)
  recentBattles.slice(-15).forEach(battle => {
    console.log(battle)
  })
  
  // Fill empty lines to keep layout consistent
  const emptyLines = 15 - recentBattles.slice(-15).length
  for (let i = 0; i < emptyLines; i++) console.log('')
  
  console.log('')
  
  // Fixed progress bar at bottom
  const progress = Math.min(100, Math.floor((currentBattle / totalBattles) * 100))
  const barWidth = 50
  const filled = Math.floor((progress / 100) * barWidth)
  const empty = barWidth - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  
  console.log(`${CYAN}  ╔══════════════════════════════════════════════════════════════╗${RESET}`)
  console.log(`${CYAN}  ║${RESET}  Progress: [${GREEN}${bar}${RESET}] ${YELLOW}${progress}%${RESET} (${currentBattle}/${totalBattles})${' '.repeat(10)}${CYAN}║${RESET}`)
  console.log(`${CYAN}  ╚══════════════════════════════════════════════════════════════╝${RESET}`)
}

function simulateTournament() {
  console.log(`${CYAN}Starting tournament...${RESET}\n`)
  
  for (let i = 0; i < pokemonDb.length; i++) {
    let pokemonA = pokemonDb[i]
    
    for (let j = i + 1; j < pokemonDb.length; j++) {
      let pokemonB = pokemonDb[j]
      currentBattle++
      
      // Run battle
      let result = simulateBattle(pokemonA, pokemonB, false)
      
      // Update scoreboard
      if (result.winnerName === pokemonA.name) {
        scoreboard[pokemonA.name].wins++
        scoreboard[pokemonB.name].losses++
      } else {
        scoreboard[pokemonB.name].wins++
        scoreboard[pokemonA.name].losses++
      }
      
      // Add to recent battles log
      const loser = result.winnerName === pokemonA.name ? pokemonB.name : pokemonA.name
      const battleLog = `  ${GREEN}${result.winnerName.padEnd(12)}${RESET} beat ${RED}${loser.padEnd(12)}${RESET} (${result.remainingHP} HP)`
      recentBattles.push(battleLog)
      if (recentBattles.length > 20) recentBattles.shift()
      
      // Redraw screen every battle (or every 5 for performance)
      if (currentBattle % 1 === 0) {
        drawScreen()
      }
    }
  }
  
  // Final results
  console.log(`\n${GREEN}✓ Tournament Complete!${RESET}\n`)
  
  // Sort rankings
  const rankings = Object.entries(scoreboard)
    .map(([name, stats]) => ({ 
      name, 
      ...stats, 
      winRate: ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) 
    }))
    .sort((a, b) => b.wins - a.wins)
  
  // Show top 15
  console.log(`${CYAN}╔════════════════════════════════════════════════════════════════╗${RESET}`)
  console.log(`${CYAN}║                    FINAL RANKINGS - TOP 15                     ║${RESET}`)
  console.log(`${CYAN}╠════════════════════════════════════════════════════════════════╣${RESET}`)
  console.log(`${CYAN}║ Rank │ Name          │ Wins │ Losses │  Win Rate  │  Score   ║${RESET}`)
  console.log(`${CYAN}╠══════╪═══════════════╪══════╪════════╪════════════╪══════════╣${RESET}`)
  
  rankings.slice(0, 15).forEach((p, index) => {
    const rank = (index + 1).toString().padStart(2)
    const name = p.name.padEnd(13)
    const wins = p.wins.toString().padStart(4)
    const losses = p.losses.toString().padStart(6)
    const rate = `${p.winRate}%`.padStart(6)
    const score = (p.wins * 3 - p.losses).toString().padStart(6)
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  '
    console.log(`${CYAN}║${RESET}  ${rank}  │ ${medal}${name}│ ${GREEN}${wins}${RESET} │ ${RED}${losses}${RESET} │  ${YELLOW}${rate}${RESET}   │  ${CYAN}${score}${RESET}  ${CYAN}║${RESET}`)
  })
  
  console.log(`${CYAN}╚════════════════════════════════════════════════════════════════╝${RESET}`)
  
  // Save results
  fs.writeFileSync('./results/tournament-gen1.json', JSON.stringify(rankings, null, 2))
  console.log(`\n✓ Full results saved to results/tournament-gen1.json`)
}

simulateTournament()
