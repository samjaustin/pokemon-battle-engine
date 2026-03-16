// Damage Calculator - Calculates damage with STAB and type effectiveness
const fs = require('fs')

const rawData = fs.readFileSync('data/pokemon-gen1.json')
const typeEffectiveness = fs.readFileSync('data/type_effectiveness_gen1.json')

const pokemonDb = JSON.parse(rawData)
const typeEffectivenessDb = JSON.parse(typeEffectiveness)

// Color codes for terminal output
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const RESET = '\x1b[0m'

function calculateDamage(a, d, m, verbose = false) {
  let attackStats
  let defenseStats
  let defenderType = d.types
  let moveType = m.type
  let damageWithStab

  // Use special or physical stats based on move category
  if (m.category === 'special') {
    attackStats = a.currentLevelStats.special
    defenseStats = d.currentLevelStats.special
  } else {
    attackStats = a.currentLevelStats.attack
    defenseStats = d.currentLevelStats.defense
  }

  // Gen 1 damage formula at level 100
  let baseDamage = ((2 * 100 / 5 + 2) * m.power * (attackStats / defenseStats)) / 50
  baseDamage = baseDamage + 2

  // Apply STAB bonus
  if (a.types.includes(m.type)) {
    baseDamage = Math.floor(baseDamage * 1.5)
    damageWithStab = baseDamage
  } else {
    damageWithStab = baseDamage
  }

  // Get type effectiveness multiplier
  let effectiveness = effectivenessCalculator(moveType, defenderType)
  let finalDamage = Math.floor(damageWithStab * effectiveness)

  if (verbose) {
    const effectiveText = effectiveness > 1 ? `${GREEN}SUPER EFFECTIVE${RESET}` : effectiveness < 1 ? `${YELLOW}not very effective${RESET}` : 'neutral'
    console.log(`  ${a.name} → ${d.name}: ${CYAN}${m.name}${RESET} deals ${RED}${finalDamage}${RESET} dmg (${effectiveText})`)
  }

  return finalDamage
}

function effectivenessCalculator(attMoveType, defType) {
  // Gen 1 type fix: Dark/Steel didn't exist
  const gen1MoveType = attMoveType === 'dark' || attMoveType === 'steel' ? 'normal' : attMoveType
  let attackingPokemonType = typeEffectivenessDb.find(apt => apt.name === gen1MoveType)
  let effectiveness = 1

  defType.forEach(type => {
    const gen1DefType = type === 'fairy' || type === 'steel' ? 'normal' : type
    let typeData = typeEffectivenessDb.find(apt => apt.name === gen1DefType)

    if (!typeData) return

    if (typeData.damageRelations.doubleDamageFrom.includes(attackingPokemonType.name)) {
      effectiveness *= 2
    } else if (typeData.damageRelations.halfDamageFrom.includes(attackingPokemonType.name)) {
      effectiveness *= 0.5
    } else if (typeData.damageRelations.noDamageFrom.includes(attackingPokemonType.name)) {
      effectiveness *= 0
    }
  })

  return effectiveness
}

module.exports = { calculateDamage }
