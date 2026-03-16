// Fetch Generation 1 Pokemon (ID 1-151) from PokeAPI with their top moves
// Prioritizes damaging moves (up to 3), fills with status moves to reach 4 total

const fs = require('fs'); // Import file system module for saving JSON

// Function to fetch a single Pokemon's basic data from PokeAPI
async function fetchPokemon(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`); // Make HTTP request to PokeAPI
  if (!response.ok) { // Check if request failed
    throw new Error(`Failed to fetch Pokemon ${id}: ${response.status}`); // Throw error with status code
  }
  return response.json(); // Parse JSON response and return it
}

// Function to fetch detailed move data to get power and damage class
async function fetchMoveDetails(moveUrl) {
  const response = await fetch(moveUrl); // Fetch the move's detail page
  if (!response.ok) { // Check for errors
    throw new Error(`Failed to fetch move: ${response.status}`); // Throw error
  }
  return response.json(); // Return move details
}

// Function to extract base stats from Pokemon data into our format
function extractBaseStats(data) {
  const baseStats = {}; // Create empty object to hold stats
  data.stats.forEach(stat => { // Loop through all stats from API
    const statName = stat.stat.name; // Get stat name (hp, attack, etc.)
    const value = stat.base_stat; // Get stat value
    
    // Map API stat names to our format
    switch(statName) {
      case 'hp': baseStats.hp = value; break; // Map HP stat
      case 'attack': baseStats.attack = value; break; // Map Attack stat
      case 'defense': baseStats.defense = value; break; // Map Defense stat
      case 'special-attack': baseStats.special = value; break; // Map Special stat
      case 'speed': baseStats.speed = value; break; // Map Speed stat
    }
  });
  return baseStats; // Return the mapped stats object
}

// Function to get Pokemon's best moves (up to 3 damaging + status fillers)
async function extractMoves(data) {
  const damagingMoves = []; // Array to collect damaging moves (physical/special)
  const statusMoves = []; // Array to collect status moves (non-damaging)
  
  // Loop through each move this Pokemon can learn
  for (const moveEntry of data.moves) {
    // Find level-up details in Gen 1 (red-blue version group)
    const levelUpDetails = moveEntry.version_group_details.find(
      v => v.move_learn_method.name === "level-up" && // Only moves learned by leveling
           v.version_group.name === "red-blue" && // Only Gen 1 Red/Blue
           v.level_learned_at <= 100 // Only moves learned at level 100 or below
    );
    
    if (levelUpDetails) { // If this move is learned by level-up in Gen 1
      try {
        const moveData = await fetchMoveDetails(moveEntry.move.url); // Fetch move details
        
        // Create move object with all relevant info
        const moveObj = {
          name: moveEntry.move.name, // Move name
          type: moveData.type.name, // Move type
          power: moveData.power || 0, // Base power (0 for status moves)
          category: moveData.damage_class.name, // "physical", "special", or "status"
          levelLearned: levelUpDetails.level_learned_at // Level when learned
        };
        
        // Separate damaging moves from status moves
        if (moveData.damage_class.name !== "status" && moveData.power > 0) { 
          damagingMoves.push(moveObj); // Add to damaging moves list
        } else {
          statusMoves.push(moveObj); // Add to status moves list
        }
      } catch (error) {
        console.error(`Error fetching move details:`, error.message); // Log error
      }
    }
  }
  
  // Sort damaging moves by power (highest first) - prioritize strongest attacks
  damagingMoves.sort((a, b) => b.power - a.power);
  
  // Take up to 3 damaging moves (80% focus on damage)
  const selectedMoves = damagingMoves.slice(0, 3);
  
  // If we have less than 4 moves, fill remaining slots with status moves
  if (selectedMoves.length < 4) {
    const remainingSlots = 4 - selectedMoves.length; // Calculate how many slots to fill
    const fillerStatusMoves = statusMoves.slice(0, remainingSlots); // Take top status moves
    selectedMoves.push(...fillerStatusMoves); // Add status moves to fill gaps
  }
  
  // If Pokemon has absolutely no moves (edge case), give them Tackle
  if (selectedMoves.length === 0) {
    selectedMoves.push({
      name: "tackle", // Universal fallback move
      type: "normal", // Normal type
      power: 40, // Base power 40
      category: "physical", // Physical category
      levelLearned: 1 // Available from level 1
    });
  }
  
  return selectedMoves; // Return final move list (1-4 moves)
}

// Main function that orchestrates the entire fetching process
async function main() {
  const pokemonList = []; // Array to store all 151 Pokemon
  
  // Loop through all Gen 1 Pokemon IDs (1 to 151)
  for (let id = 1; id <= 151; id++) {
    try {
      const data = await fetchPokemon(id); // Fetch basic Pokemon data
      
      const baseStats = extractBaseStats(data); // Extract base stats
      const moves = await extractMoves(data); // Fetch and process moves
      
      // Create our Pokemon object with all data
      const pokemon = {
        id: data.id, // Pokemon ID number
        name: data.name, // Pokemon name
        types: data.types.map(t => t.type.name), // Array of types
        baseStats: baseStats, // Base stats object
        moves: moves // Final move list (prioritizes damage, fills with status)
      };
      
      pokemonList.push(pokemon); // Add to our list
      console.log(`Fetched: ${data.name} (#${data.id}) - ${moves.length} moves`); // Progress log
    } catch (error) {
      console.error(`Error fetching Pokemon ${id}:`, error.message); // Log any errors
    }
  }
  
  const output = JSON.stringify(pokemonList, null, 2); // Convert to formatted JSON
  fs.writeFileSync('../data/pokemon-gen1.json', output); // Save to data folder
  
  console.log(`\nSaved ${pokemonList.length} Pokemon to ../data/pokemon-gen1.json`); // Success message
}

main(); // Start fetching all Pokemon
