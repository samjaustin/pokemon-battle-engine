// 1. Import the fs module (Node.js file system)
const fs = require('fs')
// 2. Read the JSON file as a string
const rawData = fs.readFileSync('data/pokemon-gen1.json')
// 3. Parse the string into a JS object/array
const pokemonDb = JSON.parse(rawData)

function calculateLevel100Stats(baseStats){
    return {
        hp:(baseStats.hp * 2) + 110,
        attack:(baseStats.attack * 2) + 5,
        defense:(baseStats.defense * 2) + 5,
        special:(baseStats.special * 2) + 5,
        speed:(baseStats.speed * 2) + 5
    }
}

pokemonDb.forEach(pokemon => {
    pokemon.level = 100
    pokemon.currentLevelStats = calculateLevel100Stats(pokemon.baseStats)
});

fs.writeFileSync('data/pokemon-gen1.json', JSON.stringify(pokemonDb, null, 2))

console.log('File saved: pokemon-gen1.json');