// Battle Simulator - Turn-based combat for Gen 1 Pokemon
const fs = require('fs')
const { calculateDamage } = require('./damage_calculator')

const rawData = fs.readFileSync('data/pokemon-gen1.json')
const pokemonDb = JSON.parse(rawData)

// Color codes
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const CYAN = '\x1b[36m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

function simulateBattle(pokemonA, pokemonB, verbose = false) {
  let hpA = pokemonA.currentLevelStats.hp
  let hpB = pokemonB.currentLevelStats.hp
  let speedA = pokemonA.currentLevelStats.speed
  let speedB = pokemonB.currentLevelStats.speed

  let first, second, winner
  let randomInt = Math.floor(Math.random() * 2)

  // Determine turn order by speed
  if (speedA > speedB) {
    first = pokemonA
    second = pokemonB
  } else if (speedA < speedB) {
    first = pokemonB
    second = pokemonA
  } else if (randomInt === 0) {
    first = pokemonB
    second = pokemonA
  } else {
    first = pokemonA
    second = pokemonB
  }

  if (verbose) {
    console.log(`\n  ${CYAN}${pokemonA.name}${RESET} HP:${hpA} SPD:${speedA} vs ${CYAN}${pokemonB.name}${RESET} HP:${hpB} SPD:${speedB}`)
    console.log(`  ${first.name} attacks first`)
  }

  let turn = 0
  const MAX_TURNS = 100 // Prevent infinite battles when both are immune
  
  while (hpA > 0 && hpB > 0 && turn < MAX_TURNS) {
    // First attacks second
    if (second === pokemonA) {
      hpA -= calculateDamage(first, second, first.moves[0], verbose)
      if (hpA <= 0) {
        winner = first
        break
      }
    } else {
      hpB -= calculateDamage(first, second, first.moves[0], verbose)
      if (hpB <= 0) {
        winner = first
        break
      }
    }

    // Second attacks first
    if (first === pokemonA) {
      hpA -= calculateDamage(second, first, second.moves[0], verbose)
      if (hpA <= 0) {
        winner = second
        break
      }
    } else {
      hpB -= calculateDamage(second, first, second.moves[0], verbose)
      if (hpB <= 0) {
        winner = second
        break
      }
    }
    turn++
  }
  
  // If max turns reached, pick winner by higher HP (handles immunity stalemates)
  if (!winner) {
    winner = hpA > hpB ? pokemonA : pokemonB
  }

  const winnerHP = winner.name === pokemonA.name ? Math.max(0, hpA) : Math.max(0, hpB)
  const loser = winner === pokemonA ? pokemonB : pokemonA

  if (verbose) {
    console.log(`  ${GREEN}WINNER: ${winner.name}${RESET} (${winnerHP} HP remaining) | Loser: ${RED}${loser.name}${RESET}`)
  }

  return {
    winnerName: winner.name,
    remainingHP: winnerHP
  }
}

module.exports = { simulateBattle }
