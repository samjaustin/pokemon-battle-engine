// Test script for PokeAPI endpoint
// Endpoint: https://pokeapi.co/api/v2/pokemon/1/

async function testPokeAPI() {
  const url = 'https://pokeapi.co/api/v2/pokemon/1/';
  
  console.log('Testing PokeAPI endpoint...');
  console.log(`URL: ${url}\n`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API Response received successfully!\n');
    console.log('--- Pokemon Details ---');
    console.log(`Name: ${data.name}`);
    console.log(`ID: ${data.id}`);
    console.log(`Height: ${data.height}`);
    console.log(`Weight: ${data.weight}`);
    console.log(`Base Experience: ${data.base_experience}`);
    console.log(`Types: ${data.types.map(t => t.type.name).join(', ')}`);
    console.log(`Abilities: ${data.abilities.map(a => a.ability.name).join(', ')}`);
    console.log(`Stats: ${data.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join(', ')}`);
    console.log('\n--- Full Response (first 500 chars) ---');
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    throw error;
  }
}

// Run the test
testPokeAPI();
