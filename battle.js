// 1. Import the fs module (Node.js file system)
const fs = require('fs')

const { calculateDamage } = require('./damage_calculator');

const rawData = fs.readFileSync('data/pokemon-gen1.json')
const pokemonDb = JSON.parse(rawData)

function simulateBattle(pokemonA, pokemonB) {
    let hpA = pokemonA.currentLevelStats.hp;
    let hpB = pokemonB.currentLevelStats.hp;

    let speedA = pokemonA.currentLevelStats.speed;
    let speedB = pokemonB.currentLevelStats.speed;
    let first;
    let second;
    let randomInt = Math.floor(Math.random() * 2)
    let winner;
    if (speedA > speedB) {
        first = pokemonA
        second = pokemonB
    } else if (speedA < speedB) {
        first = pokemonB
        second = pokemonA
    } else if (randomInt === 0) {
        first = pokemonB
        second = pokemonA
    } else if (randomInt === 1) {
        first = pokemonA
        second = pokemonB
    }

    while (hpA > 0 && hpB > 0) {
        // First attacks second
        // Damage goes to whoever is "second"
        if (second === pokemonA) {
            hpA -= calculateDamage(first, second, first.moves[0])
            if (hpA <= 0) {      // pokemonA (second) fainted
                winner = first    // first wins
                break
            }
        } else {
            hpB -= calculateDamage(first, second, first.moves[0])
            if (hpB <= 0) {      // pokemonB (second) fainted
                winner = first    // first wins
                break
            }
        }

        // Second attacks first  
        // Damage goes to whoever is "first"
        if (first === pokemonA) {
            hpA -= calculateDamage(second, first, second.moves[0])
            if (hpA <= 0) {       // pokemonA (first) fainted
                winner = second    // second wins
                break
            }
        } else {
            hpB -= calculateDamage(second, first, second.moves[0])
            if (hpB <= 0) {       // pokemonB (first) fainted
                winner = second    // second wins
                break
            }
        }
    } return {
        winnerName: winner.name,
        remainingHP: winner.name === pokemonA.name ? hpA : hpB
    };
}

const pokemonA = pokemonDb.find(p => p.name === 'caterpie');
const pokemonB = pokemonDb.find(p => p.name === 'bulbasaur');

const result = simulateBattle(pokemonA, pokemonB);
console.log(result);
