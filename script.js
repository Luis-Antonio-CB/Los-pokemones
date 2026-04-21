// Elementos del DOM
const catalogContainer = document.getElementById('pokemon-catalog');
const teamSlots = document.getElementById('team-slots');
const teamCount = document.getElementById('count');
const teamNameInput = document.getElementById('team-name');

let team = [];
let allPokemons = []; // Guardar catálogo para generar equipos rivales

// Base de datos IndexedDB para almacenar el equipo de forma persistente
const dbName = "PokemonAppDB";
let db;

// Inicializar la base de datos
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains('team')) {
                db.createObjectStore('team', { keyPath: 'uniqueId' });
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

const savePokemonToDB = (pokemon) => {
    const transaction = db.transaction(['team'], 'readwrite');
    const store = transaction.objectStore('team');
    store.put(pokemon);
};

const deletePokemonFromDB = (uniqueId) => {
    const transaction = db.transaction(['team'], 'readwrite');
    const store = transaction.objectStore('team');
    store.delete(uniqueId);
};

const loadTeamFromDB = () => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['team'], 'readonly');
        const store = transaction.objectStore('team');
        const request = store.getAll();
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
};

// Legendarios de Kanto (IDs de la PokeAPI para la 1ra generación)
const legendariesIds = [144, 145, 146, 150, 151];

// Cargar catálogo usando la PokeAPI de forma asíncrona
async function loadCatalog() {
    catalogContainer.innerHTML = '<p style="text-align:center;width:100%;color:white;">Cargando la Pokédex de Kanto...</p>';
    
    try {
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
        allPokemons = pokemons; // Guardar referencia global para la batalla

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
    
    const teamMember = {
        ...pokemon,
        stats: {
            hp: getRandomStat(20, 100),
            atk: getRandomStat(10, 100),
            def: getRandomStat(10, 100),
            spd: getRandomStat(10, 100)
        },
        uniqueId: Date.now() + Math.random() 
    };

    team.push(teamMember);
    savePokemonToDB(teamMember); // Guardar en base de datos
    renderTeam();
}

// Función para remover del equipo
function removeFromTeam(uniqueId) {
    team = team.filter(p => p.uniqueId !== uniqueId);
    deletePokemonFromDB(uniqueId); // Eliminar de base de datos
    renderTeam();
}

// Renderizar la sección del equipo
function renderTeam() {
    teamCount.textContent = team.length;
    
    if (team.length === 0) {
        teamSlots.innerHTML = '<div class="empty-state">Tu equipo está vacío. Añade Pokémon desde el catálogo.</div>';
        teamSlots.style.display = 'block';
        return;
    }

    teamSlots.style.display = 'grid';
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
        
        slot.querySelector('.remove-btn').addEventListener('click', () => {
            removeFromTeam(member.uniqueId);
        });
        
        teamSlots.appendChild(slot);
    });
}

// Físicas con el cursor (Efecto Parallax y Tilt 3D en tarjetas)
document.addEventListener('mousemove', (e) => {
    // Físicas de parallax para el fondo
    const bgX = (e.clientX / window.innerWidth - 0.5) * 40;
    const bgY = (e.clientY / window.innerHeight - 0.5) * 40;
    document.body.style.backgroundPosition = `${bgX}px ${bgY}px`;

    // Físicas en las tarjetas
    const cards = document.querySelectorAll('.catalog-card, .team-member-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const distance = Math.sqrt(x*x + y*y);
        
        // Efecto magnético y 3D si el cursor está cerca (radio de 350px)
        if (distance < 350) {
            const intensity = 1 - (distance / 350);
            const angleX = (-y / 15) * intensity;
            const angleY = (x / 15) * intensity;
            
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-5px)`;
            card.style.boxShadow = `${-angleY}px ${angleX + 10}px 20px rgba(0,0,0,0.4)`;
            card.style.borderColor = "var(--secondary)";
            card.style.zIndex = "10";
            card.style.transition = "transform 0.1s ease-out, box-shadow 0.1s ease-out";
        } else {
            // Restaurar estado normal
            card.style.transform = ``;
            card.style.boxShadow = ``;
            card.style.borderColor = ``;
            card.style.zIndex = `1`;
            card.style.transition = "all 0.3s ease-out";
        }
    });
});

// --- Lógica de Batalla e Importación/Exportación ---
const exportBtn = document.getElementById('export-btn');
const battleBtn = document.getElementById('battle-btn');
const battleModal = document.getElementById('battle-modal');
const closeModal = document.getElementById('close-modal');
const playerArenaSlots = document.getElementById('player-arena-slots');
const enemyArenaSlots = document.getElementById('enemy-arena-slots');
const playerScoreEl = document.getElementById('player-score');
const enemyScoreEl = document.getElementById('enemy-score');
const battleResultEl = document.getElementById('battle-result');
const playerTeamNameDisplay = document.getElementById('player-team-name-display');
const enemyNameDisplay = document.getElementById('enemy-name');

exportBtn.addEventListener('click', () => {
    if (team.length === 0) {
        alert("¡Tu equipo está vacío! Añade Pokémon antes de exportar.");
        return;
    }
    
    const exportData = {
        name: teamNameInput.value.trim() || "Equipo Rival",
        team: team
    };
    
    // Convertir el equipo a Base64 para hacerlo compartible
    const encoded = btoa(JSON.stringify(exportData));
    
    navigator.clipboard.writeText(encoded).then(() => {
        alert("¡Código de tu equipo copiado al portapapeles!\nCompártelo con tu competidor para que pueda pelear contra ti.");
    }).catch(err => {
        prompt("Copia manualmente este código y compártelo:", encoded);
    });
});

battleBtn.addEventListener('click', () => {
    if (team.length === 0) {
        alert("¡Necesitas al menos 1 Pokémon en tu equipo para pelear!");
        return;
    }
    
    const enemyCode = prompt("Pega aquí el código del equipo de tu competidor:");
    if (!enemyCode) return; // Se canceló el prompt
    
    let enemyData;
    try {
        enemyData = JSON.parse(atob(enemyCode));
        if (!enemyData.team || !Array.isArray(enemyData.team)) throw new Error("Código inválido");
    } catch (e) {
        alert("El código del rival no es válido. ¡Asegúrate de copiarlo completo!");
        return;
    }
    
    const enemyTeam = enemyData.team;
    const enemyTeamSize = enemyTeam.length;
    
    // Configurar nombres
    const myName = teamNameInput.value.trim() || "Tu Equipo";
    playerTeamNameDisplay.textContent = myName;
    enemyNameDisplay.textContent = enemyData.name;
    
    // Limpiar modal
    playerArenaSlots.innerHTML = '';
    enemyArenaSlots.innerHTML = '';
    playerScoreEl.textContent = 'Poder: Calculando...';
    enemyScoreEl.textContent = 'Poder: Calculando...';
    battleResultEl.className = 'battle-result';
    battleResultEl.textContent = '';
    
    // Mostrar modal
    battleModal.style.display = 'flex';
    
    // Animación de despliegue
    let myPower = 0;
    let enemyPower = 0;
    
    setTimeout(() => {
        team.forEach((p, idx) => {
            setTimeout(() => {
                const pokeDiv = document.createElement('div');
                pokeDiv.className = 'arena-pokemon';
                pokeDiv.innerHTML = `<img src="${p.image}" alt="${p.name}">`;
                playerArenaSlots.appendChild(pokeDiv);
                
                const statsTotal = p.stats.hp + p.stats.atk + p.stats.def + p.stats.spd;
                myPower += statsTotal;
                playerScoreEl.textContent = `Poder: ${myPower}`;
            }, idx * 300);
        });
        
        enemyTeam.forEach((p, idx) => {
            setTimeout(() => {
                const pokeDiv = document.createElement('div');
                pokeDiv.className = 'arena-pokemon';
                pokeDiv.innerHTML = `<img src="${p.image}" alt="${p.name}">`;
                enemyArenaSlots.appendChild(pokeDiv);
                
                const statsTotal = p.stats.hp + p.stats.atk + p.stats.def + p.stats.spd;
                enemyPower += statsTotal;
                enemyScoreEl.textContent = `Poder: ${enemyPower}`;
                
                // Si es el último, calcular y mostrar ganador
                if (idx === enemyTeamSize - 1) {
                    setTimeout(() => {
                        if (myPower > enemyPower) {
                            battleResultEl.textContent = "¡VICTORIA! 🎉";
                            battleResultEl.className = "battle-result result-victory result-show";
                        } else if (myPower < enemyPower) {
                            battleResultEl.textContent = "¡DERROTA! 💀";
                            battleResultEl.className = "battle-result result-defeat result-show";
                        } else {
                            battleResultEl.textContent = "¡EMPATE! ⚔️";
                            battleResultEl.className = "battle-result result-draw result-show";
                        }
                    }, 500);
                }
            }, idx * 300);
        });
    }, 300);
});

closeModal.addEventListener('click', () => {
    battleModal.style.display = 'none';
});

// Inicializar la aplicación
async function initializeApp() {
    // Restaurar el nombre del equipo guardado
    const savedName = localStorage.getItem('teamName');
    if (savedName) teamNameInput.value = savedName;

    // Guardar nombre del equipo en LocalStorage al escribir
    teamNameInput.addEventListener('input', (e) => {
        localStorage.setItem('teamName', e.target.value);
    });

    try {
        await initDB();
        team = await loadTeamFromDB();
        renderTeam();
    } catch (e) {
        console.error("Error al cargar la base de datos:", e);
    }
    
    loadCatalog();
}

// Arrancar
initializeApp();
