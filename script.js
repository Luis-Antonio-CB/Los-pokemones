// Elementos del DOM
const catalogContainer = document.getElementById('pokemon-catalog');
const teamSlots = document.getElementById('team-slots');
const teamCount = document.getElementById('count');

let team = [];

// Legendarios de Kanto (IDs de la PokeAPI para la 1ra generación)
// 144: Articuno, 145: Zapdos, 146: Moltres, 150: Mewtwo, 151: Mew
const legendariesIds = [144, 145, 146, 150, 151];

// Cargar catálogo usando la PokeAPI de forma asíncrona
async function loadCatalog() {
    catalogContainer.innerHTML = '<p style="text-align:center;width:100%;color:white;">Cargando la Pokédex de Kanto...</p>';
    
    try {
        // Pedimos los primeros 151 (1ra generación)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();
        
        let pokemons = data.results.map((p, index) => {
            const id = index + 1;
            return {
                id: id,
                name: p.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
            };
        });

        // Aplicamos el filtro: excluir legendarios
        pokemons = pokemons.filter(p => !legendariesIds.includes(p.id));

        renderCatalog(pokemons);
    } catch (error) {
        catalogContainer.innerHTML = '<p style="color:red;text-align:center;">Hubo un error cargando los Pokémon. Revisa tu conexión a internet.</p>';
    }
}

// Función para generar un número aleatorio entre min y max
function getRandomStat(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Renderiza los Pokémon disponibles
function renderCatalog(pokemons) {
    catalogContainer.innerHTML = '';
    
    pokemons.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'catalog-card';
        card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <h2>#${pokemon.id} ${pokemon.name}</h2>
            <button class="add-btn">Capturar</button>
        `;
        
        // Asignar el evento para añadir al equipo
        card.querySelector('.add-btn').addEventListener('click', () => {
            addToTeam(pokemon);
        });
        
        catalogContainer.appendChild(card);
    });
}

// Función para añadir al equipo
function addToTeam(pokemon) {
    if (team.length >= 6) {
        alert("¡Tu equipo ya está lleno! El límite es de 6 Pokémon.");
        return;
    }
    
    // Al añadir, le asignamos estadísticas TOTALMENTE aleatorias del 10 al 100
    const teamMember = {
        ...pokemon,
        stats: {
            hp: getRandomStat(20, 100),
            atk: getRandomStat(10, 100),
            def: getRandomStat(10, 100),
            spd: getRandomStat(10, 100)
        },
        uniqueId: Date.now() + Math.random() // ID único para poder borrar si tenemos repetidos
    };

    team.push(teamMember);
    renderTeam();
}

// Función para remover del equipo
function removeFromTeam(uniqueId) {
    team = team.filter(p => p.uniqueId !== uniqueId);
    renderTeam();
}

// Renderizar la sección del equipo
function renderTeam() {
    teamCount.textContent = team.length;
    
    if (team.length === 0) {
        teamSlots.innerHTML = '<div class="empty-state">Tu equipo está vacío. Añade Pokémon desde el catálogo.</div>';
        teamSlots.style.display = 'block'; // Volver al estado normal para el mensaje
        return;
    }

    teamSlots.style.display = 'grid'; // Restaura el display en grid
    teamSlots.innerHTML = '';
    
    team.forEach(member => {
        const slot = document.createElement('div');
        slot.className = 'team-member-card';
        slot.innerHTML = `
            <img src="${member.image}" alt="${member.name}" class="team-image">
            <h3>${member.name}</h3>
            <div class="stats-grid">
                <div class="stat"><span>HP</span>${member.stats.hp}</div>
                <div class="stat"><span>ATK</span>${member.stats.atk}</div>
                <div class="stat"><span>DEF</span>${member.stats.def}</div>
                <div class="stat"><span>SPD</span>${member.stats.spd}</div>
            </div>
            <button class="remove-btn">Liberar</button>
        `;
        
        // Botón de eliminar
        slot.querySelector('.remove-btn').addEventListener('click', () => {
            removeFromTeam(member.uniqueId);
        });
        
        teamSlots.appendChild(slot);
    });
}

// Arrancar la aplicación pidiendo los datos a la PokeAPI
loadCatalog();
