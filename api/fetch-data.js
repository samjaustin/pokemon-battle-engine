// Fetch Generation 1 Pokemon (ID 1-10) from PokeAPI
// Saves JSON array with id, name, types, and baseStats to pokemon-gen1.json

const fs = require('fs');

async function fetchPokemon(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon ${id}: ${response.status}`);
  }
  return response.json();
}

async function main() {
  const pokemonList = [];
  
  for (let id = 1; id <= 10; id++) {
    try {
      const data = await fetchPokemon(id);
      
      // Extract base stats into the required format
      const baseStats = {};
      data.stats.forEach(stat => {
        const statName = stat.stat.name;
        const value = stat.base_stat;
        
        // Map API stat names to our format
        switch(statName) {
          case 'hp': baseStats.hp = value; break;
          case 'attack': baseStats.attack = value; break;
          case 'defense': baseStats.defense = value; break;
          case 'special-attack': baseStats.special = value; break;
          case 'speed': baseStats.speed = value; break;
        }
      });
      
      const pokemon = {
        id: data.id,
        name: data.name,
        types: data.types.map(t => t.type.name),
        baseStats: baseStats
      };
      
      pokemonList.push(pokemon);
      console.log(`Fetched: ${data.name} (#${data.id})`);
    } catch (error) {
      console.error(`Error fetching Pokemon ${id}:`, error.message);
    }
  }
  
  // Save to JSON file
  const output = JSON.stringify(pokemonList, null, 2);
  fs.writeFileSync('../data/pokemon-gen1.json', output);
  console.log('\nSaved to pokemon-gen1.json');
}

main();
