// Datos fijos de 8 Pokémon (para que después del filtro queden exactamente 6 no legendarios)
const pokemons = [
    {
        id: "001",
        name: "Bulbasaur",
        types: ["grass", "poison"],
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
        isLegendary: false,
        color: "--type-grass"
    },
    {
        id: "004",
        name: "Charmander",
        types: ["fire"],
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
        isLegendary: false,
        color: "--type-fire"
    },
    {
        id: "007",
        name: "Squirtle",
        types: ["water"],
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
        isLegendary: false,
        color: "--type-water"
    },
    {
        id: "025",
        name: "Pikachu",
        types: ["electric"],
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
        isLegendary: false,
        color: "--type-electric"
    },
    {
        id: "133",
        name: "Eevee",
        types: ["normal"],
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
        isLegendary: false,
        color: "--type-normal"
    },
    {
        id: "143",
        name: "Snorlax",
        types: ["normal"],
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
        isLegendary: false,
        color: "--type-normal"
    },
    {
        id: "145",
        name: "Zapdos",
        types: ["electric", "flying"],
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png",
        isLegendary: true,
        color: "--type-electric"
    },
    {
        id: "150",
        name: "Mewtwo",
        types: ["psychic"],
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
        isLegendary: true,
        color: "--type-psychic"
    }
];

// Filtrar el array directamente para el Sprint 1
const pokemonsSprint1 = pokemons.filter(pokemon => !pokemon.isLegendary);

// Elementos del DOM
const container = document.getElementById('pokemon-container');

// Colores por tipo
const typeColors = {
    grass: '#4ade80',
    poison: '#a855f7',
    fire: '#fb923c',
    water: '#60a5fa',
    electric: '#facc15',
    flying: '#94a3b8',
    psychic: '#e879f9',
    normal: '#a8a29e'
};

// Función para renderizar los Pokémon
function renderPokemons() {
    container.innerHTML = '';

    if (pokemonsSprint1.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">No hay Pokémon para mostrar.</p>';
        return;
    }

    // Usar el array ya filtrado
    pokemonsSprint1.forEach((pokemon, index) => {
        // Generar badges de tipo
        const typeBadges = pokemon.types.map(type => 
            `<span class="type-badge" style="background-color: ${typeColors[type]}">${type}</span>`
        ).join('');

        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <span class="pokemon-id">#${pokemon.id}</span>
            <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image">
            <h2 class="pokemon-name">${pokemon.name}</h2>
            <div class="pokemon-types">
                ${typeBadges}
            </div>
        `;

        container.appendChild(card);
    });
}

// Inicializar la vista
renderPokemons();
