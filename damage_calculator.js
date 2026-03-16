const fs = require('fs')

const rawData = fs.readFileSync('data/pokemon-gen1.json')
const typeEffectiveness = fs.readFileSync('data/type_effectiveness_gen1.json')

const pokemonDb = JSON.parse(rawData)
const typeEffectivenessDb = JSON.parse(typeEffectiveness)

function calculateDamage(a,d,m){
    let attackStats;
    let defenseStats;
    let defenderType = d.types;
    let moveType = m.type;
    let damageWithStab;

    console.log(`\n--- DAMAGE CALCULATION ---`)
    console.log(`${a.name} uses ${m.name} against ${d.name}!`)
    console.log(`Move: ${m.name} | Type: ${m.type} | Power: ${m.power} | Category: ${m.category}`)

    if (m.category === 'special'){
        attackStats = a.currentLevelStats.special
        defenseStats = d.currentLevelStats.special
        console.log(`Using SPECIAL stats: ${a.name} Special=${attackStats} vs ${d.name} Special=${defenseStats}`)
    } else {
        attackStats = a.currentLevelStats.attack
        defenseStats = d.currentLevelStats.defense
        console.log(`Using PHYSICAL stats: ${a.name} Attack=${attackStats} vs ${d.name} Defense=${defenseStats}`)
    }

    let baseDamage = ((2 * 100 / 5 + 2) * m.power * (attackStats / defenseStats)) / 50
    baseDamage = baseDamage + 2
    console.log(`Base damage (before modifiers): ${Math.floor(baseDamage)}`)

    if (a.types.includes(m.type)){
        baseDamage = Math.floor(baseDamage * 1.5)
        damageWithStab = baseDamage
        console.log(`[STAB] ${a.name} is ${m.type}-type using ${m.type}-type move! 1.5x bonus applied!`)
        console.log(`[STAB] Damage after STAB: ${damageWithStab}`)
    } else {
        damageWithStab = baseDamage
        console.log(`[STAB] No STAB bonus (move type doesn't match Pokemon type)`)
    }

    let effectiveness = effectivenessCalculator(moveType, defenderType, a.name, d.name)
    console.log(`[TYPE] Effectiveness multiplier: ${effectiveness}x`)

    let finalDamage = Math.floor(damageWithStab * effectiveness)
    console.log(`[FINAL] ${damageWithStab} × ${effectiveness} = ${finalDamage} damage!`)
    console.log(`--- END ---\n`)

    return finalDamage
}

function effectivenessCalculator(attMoveType, defType, attackerName, defenderName){
    let attackingPokemonType = typeEffectivenessDb.find(apt => apt.name === attMoveType)
    let effectiveness = 1

    console.log(`[TYPE] Checking type matchup: ${attMoveType} vs ${defType.join('/')}`)

    defType.forEach(type => {
        let typeData = typeEffectivenessDb.find(apt => apt.name === type)

        if (typeData.damageRelations.doubleDamageFrom.includes(attackingPokemonType.name)) {
            effectiveness *= 2
            console.log(`  → ${attMoveType} is SUPER EFFECTIVE against ${type}! (2x)`)
        } else if (typeData.damageRelations.halfDamageFrom.includes(attackingPokemonType.name)){
            effectiveness *= 0.5
            console.log(`  → ${attMoveType} is not very effective against ${type} (0.5x)`)
        } else if (typeData.damageRelations.noDamageFrom.includes(attackingPokemonType.name)){
            effectiveness *= 0
            console.log(`  → ${attMoveType} has NO EFFECT on ${type}! (0x)`)
        } else {
            console.log(`  → ${attMoveType} is neutral against ${type} (1x)`)
        }
    });

    if (defType.length > 1) {
        console.log(`  → Combined effectiveness: ${effectiveness}x (dual-type multiplier)`)
    }

    return effectiveness
}

// console.log("╔════════════════════════════════════════════════════════════╗")
// console.log("║     POKEMON GEN 1 DAMAGE CALCULATOR - BATTLE SIMULATION    ║")
// console.log("╚════════════════════════════════════════════════════════════╝")

// const attacker = pokemonDb.find(p => p.name === 'venusaur');
// const defender = pokemonDb.find(p => p.name === 'wartortle');
// const attackerMove = attacker.moves[0];

// console.log(`\n[SETUP] Attacker: ${attacker.name.toUpperCase()}`)
// console.log(`        Types: ${attacker.types.join('/')}`)
// console.log(`        Level 100 Stats - Special: ${attacker.currentLevelStats.special}`)

// console.log(`\n[SETUP] Defender: ${defender.name.toUpperCase()}`)
// console.log(`        Types: ${defender.types.join('/')}`)
// console.log(`        Level 100 Stats - Special: ${defender.currentLevelStats.special}`)

// console.log(`\n[SETUP] Move: ${attackerMove.name.toUpperCase()}`)
// console.log(`        Type: ${attackerMove.type} | Power: ${attackerMove.power} | Category: ${attackerMove.category}`)

// calculateDamage(attacker,defender,attackerMove)

module.exports = { calculateDamage };