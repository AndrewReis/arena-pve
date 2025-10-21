const DATA_BASE_CHARACTERS = [
  {
    id: "iron_man",
    name: "Iron Man",
    role: "Blaster",
    stats: {
      health: 120,
      stamina: 80,
      attack: 25,
      defense: 15,
      accuracy: 85,
      evasion: 10,
      velocity: 5
    },
    abilities: [
      {
        id: "repulsor_blast",
        name: "Repulsor Blast",
        type: "ranged",
        value: 20,
        staminaCost: 10,
        cooldown: 1,
        target: "enemy-single",
        isBlocked: false,
        effects: [
          { attribute: "health", value: -20, duration: 0 }, // dano instantâneo
          { attribute: "stamina", value: -10, duration: 0 } // reduz stamina
        ]
      },
      {
        id: "missile_strike",
        name: "Missile Strike",
        type: "ranged",
        value: 30,
        staminaCost: 15,
        cooldown: 2,
        isBlocked: false,
        target: "enemy-all",
        effects: [
          { attribute: "health", value: -30, duration: 0 }
        ]
      }
    ]
  },
  {
    id: "captain_america",
    name: "Captain America",
    role: "Tactician",
    stats: {
      health: 150,
      stamina: 70,
      attack: 20,
      defense: 20,
      accuracy: 80,
      evasion: 12,
      velocity: 10
    },
    abilities: [
      {
        id: "shield_throw",
        name: "Shield Throw",
        type: "ranged",
        value: 15,
        staminaCost: 5,
        cooldown: 1,
        isBlocked: false,
        target: "enemy-single",
        effects: [
          { attribute: "health", value: -15, duration: 5 }
        ]
      },
      {
        id: "heroic_strike",
        name: "Heroic Strike",
        type: "melee",
        value: 25,
        staminaCost: 10,
        cooldown: 2,
        isBlocked: false,
        target: "enemy-single",
        effects: [
          { attribute: "health", value: -25, duration: 0 }
        ]
      }
    ]
  },
  {
    id: "black_widow",
    name: "Black Widow",
    role: "Infiltrator",
    stats: {
      health: 100,
      stamina: 90,
      attack: 18,
      defense: 12,
      accuracy: 90,
      evasion: 15,
      velocity: 6
    },
    abilities: [
      {
        id: "pistol_shot",
        name: "Pistol Shot",
        type: "ranged",
        value: 18,
        staminaCost: 5,
        isBlocked: false,
        cooldown: 1,
        target: "enemy-single",
        effects: [
          { attribute: "health", value: -18, duration: 0 }
        ]
      },
      {
        id: "stealth_attack",
        name: "Stealth Attack",
        type: "melee",
        value: 25,
        staminaCost: 10,
        cooldown: 2,
        isBlocked: false,
        target: "enemy-single",
        effects: [
          { attribute: "health", value: -25, duration: 0 },
          { attribute: "evasion", value: 5, duration: 2 } // buff de evasão temporário
        ]
      }
    ]
  },
  {
    id: "hulk",
    name: "Hulk",
    role: "Bruiser",
    stats: {
      health: 200,
      stamina: 50,
      attack: 35,
      defense: 25,
      accuracy: 70,
      evasion: 5,
      velocity: 3
    },
    abilities: [
      {
        id: "smash",
        name: "Smash",
        type: "melee",
        value: 40,
        staminaCost: 10,
        cooldown: 1,
        isBlocked: false,
        target: "enemy-single",
        effects: [
          { attribute: "health", value: -40, duration: 0 }
        ]
      },
      {
        id: "ground_pound",
        name: "Ground Pound",
        type: "melee",
        value: 25,
        staminaCost: 15,
        cooldown: 2,
        isBlocked: false,
        target: "enemy-all",
        effects: [
          { attribute: "health", value: -25, duration: 0 },
          { attribute: "stamina", value: -10, duration: 0 }
        ]
      }
    ]
  },
  {
    id: "thor",
    name: "Thor",
    role: "Blaster",
    stats: {
      health: 180,
      stamina: 60,
      attack: 30,
      defense: 20,
      accuracy: 75,
      evasion: 8,
      velocity: 4
    },
    abilities: [
      {
        id: "mjolnir_throw",
        name: "Mjolnir Throw",
        type: "ranged",
        value: 35,
        staminaCost: 12,
        cooldown: 2,
        isBlocked: false,
        target: "enemy-single",
        effects: [
          { attribute: "health", value: -35, duration: 0 }
        ]
      },
      {
        id: "lightning_strike",
        name: "Lightning Strike",
        type: "ranged",
        value: 40,
        staminaCost: 15,
        isBlocked: false,
        cooldown: 3,
        target: "enemy-all",
        effects: [
          { attribute: "health", value: -40, duration: 0 }
        ]
      }
    ]
  },
  {
    id: "hawkeye",
    name: "Hawkeye",
    role: "Infiltrator",
    stats: {
      health: 110,
      stamina: 85,
      attack: 22,
      defense: 10,
      accuracy: 95,
      evasion: 14,
      velocity: 5
    },
    abilities: [
      {
        id: "arrow_shot",
        name: "Arrow Shot",
        type: "ranged",
        value: 20,
        staminaCost: 5,
        cooldown: 1,
        isBlocked: false,
        target: "enemy-single",
        effects: [
          { attribute: "health", value: -20, duration: 0 }
        ]
      },
      {
        id: "trick_arrow",
        name: "Trick Arrow",
        type: "ranged",
        value: 25,
        staminaCost: 10,
        cooldown: 2,
        target: "enemy-single",
        isBlocked: false,
        effects: [
          { attribute: "health", value: -25, duration: 0 },
          { attribute: "stamina", value: -10, duration: 0 }
        ]
      }
    ]
  }
];

class GameEngine {
  state = {
    heroes: [],
    enemies: [],
    currentPlayer: null,
    turnOrder: [],
    isGameOver: false,
    effectsQueue: [],
    abilitiesCooldowns: {}
  };

  constructor({ heroes, enemies }) {
    this.state.heroes = heroes;
    this.state.enemies = enemies;
    this.initializeTurnOrder();
  }

  getState() {
    return this.state;
  }

  applyAction(actionIdx, targetId) {
    let player = [...this.state.heroes, ...this.state.enemies].find(char => char.id === this.state.currentPlayer);
    let ability = player.abilities[actionIdx];

    if (ability.isBlocked) {
      alert("Ability is blocked due to insufficient stamina!");
      return;
    }

    let target = [...this.state.heroes, ...this.state.enemies].find(char => char.id === targetId);

    player.stats.stamina -= ability.staminaCost;
    target.stats.health -= ability.value;

    if (ability.cooldown > 0) {
      this.setCooldown(player.id, ability.id, ability.cooldown);
    }

    if (target.stats.health < 0) {
      this.removeCharacter(target.id);
    }

    if (ability.effects) {
      ability.effects.forEach(effect => {
        this.state.effectsQueue.push({ targetId: target.id, effect: effect, remainingDuration: effect.duration });
      });
    }

    this.nextTurn();
  }

  applyEffects() {
    this.state.effectsQueue.forEach((effectEntry, index) => {
      const target = [...this.state.heroes, ...this.state.enemies].find(char => char.id === effectEntry.targetId);
      if (target) {
        target.stats[effectEntry.effect.attribute] += effectEntry.effect.value;
        effectEntry.remainingDuration -= 1;
        if (effectEntry.remainingDuration <= 0) {
          this.state.effectsQueue.splice(index, 1);
        }
      }
    });
  }

  checkAvailableActions() {
    [...this.state.heroes, ...this.state.enemies].forEach(char => {
      char.abilities.forEach(ability => {
        const onCooldown = this.getAbilityCooldown(char.id, ability.id) > 0;
        const hasStamina = char.stats.stamina >= ability.staminaCost;

        if (onCooldown || !hasStamina) {
          ability.isBlocked = true;
        } else {
          ability.isBlocked = false;
        }
      });
    })
  }

  getAbilityCooldown(playerId, abilityId) {
    return (this.state.abilitiesCooldowns[playerId] && this.state.abilitiesCooldowns[playerId][abilityId]) || 0;
  }

  setCooldown(playerId, abilityId, cooldown) {
    if (!this.state.abilitiesCooldowns[playerId]) {
      this.state.abilitiesCooldowns[playerId] = {};
    }
    this.state.abilitiesCooldowns[playerId][abilityId] = cooldown;
  }

  removeCooldowns() {
    Object.keys(this.state.abilitiesCooldowns).forEach(charId => {
      Object.keys(this.state.abilitiesCooldowns[charId]).forEach(abilityId => {
        this.state.abilitiesCooldowns[charId][abilityId] -= 1;
        if (this.state.abilitiesCooldowns[charId][abilityId] <= 0) {
          delete this.state.abilitiesCooldowns[charId][abilityId];
        }
      });
    });
  }

  removeCharacter(characterId) {
    this.state.heroes = this.state.heroes.filter(hero => hero.id !== characterId);
    this.state.enemies = this.state.enemies.filter(enemy => enemy.id !== characterId);
    this.state.turnOrder = this.state.turnOrder.filter(id => id !== characterId);
  }

  nextTurn() {
    const currentIndex = this.state.turnOrder.indexOf(this.state.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.state.turnOrder.length;
    this.state.currentPlayer = this.state.turnOrder[nextIndex];
    this.applyEffects();
    this.removeCooldowns();
    this.checkAvailableActions();

    this.createDraw();
    console.log(this.getState());
  }

  initializeTurnOrder() {
    this.state.turnOrder = [...this.state.heroes, ...this.state.enemies].sort((a, b) => b.stats.velocity - a.stats.velocity).map((char) => char.id);
    this.state.currentPlayer = this.state.turnOrder[0];
  }

  createDraw() {
    const app = document.getElementById('app');
    const container = document.createElement('div');
    container.className = 'game-container';

    const nextTurnBtn = document.createElement('button');
    nextTurnBtn.innerText = 'Next Turn';
    nextTurnBtn.onclick = () => {
      this.nextTurn();
    };

    container.appendChild(nextTurnBtn);

    const turnInfo = document.createElement('div');
    turnInfo.className = 'turn-info';
    turnInfo.innerText = `Current Turn: ${this.state.currentPlayer}`;
    app.appendChild(turnInfo);

    const heroesSection = document.createElement('div');
    heroesSection.className = 'heroes-section';
    this.state.heroes.forEach(hero => {
      const heroDiv = document.createElement('div');
      const abilityDiv = document.createElement('div');
      heroDiv.className = 'hero';
      heroDiv.innerText = `${hero.name} - HP: ${hero.stats.health} - Stamina: ${hero.stats.stamina}`;

      hero.abilities.forEach((ability, index) => {
        const abilityBtn = document.createElement('button');
        abilityBtn.innerText = `${ability.name} (Cost: ${ability.staminaCost})`;
        abilityBtn.onclick = () => {
          const targetId = prompt(`Enter target ID for ${ability.name}:`);
          this.applyAction(index, targetId);
          app.innerHTML = '';
          this.createDraw();
        };
        abilityDiv.appendChild(abilityBtn);
      });

      heroDiv.appendChild(abilityDiv);
      heroesSection.appendChild(heroDiv);
    });
    container.appendChild(heroesSection);

    const enemiesSection = document.createElement('div');
    enemiesSection.className = 'enemies-section';
    this.state.enemies.forEach(enemy => {
      const enemyDiv = document.createElement('div');
      enemyDiv.className = 'enemy';
      enemyDiv.innerText = `${enemy.name} - HP: ${enemy.stats.health} - Stamina: ${enemy.stats.stamina}`;
      enemiesSection.appendChild(enemyDiv);
    });
    container.appendChild(enemiesSection);

    app.appendChild(container);
  }
}

const gameEngine = new GameEngine({
  heroes: [DATA_BASE_CHARACTERS[0], DATA_BASE_CHARACTERS[1]],
  enemies: [DATA_BASE_CHARACTERS[2], DATA_BASE_CHARACTERS[3]]
});

gameEngine.createDraw();