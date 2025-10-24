import { Character, State } from "./types";

export class GameEngine {
  private id: string;
  private enemyMoviment: { actionIndex: number; targetId: string; } | null = null;
  private state: State = {
    heroes: [],
    enemies: [],
    currentPlayer: null,
    turnOrder: [],
    isGameOver: false,
    effectsQueue: [],
    abilitiesCooldowns: {}
  };

  constructor({ heroes, enemies, id }: { heroes: Character[]; enemies: Character[], id: string }) {
    this.state.heroes = heroes;
    this.state.enemies = enemies;
    this.id = id;
    this.initializeTurnOrder();
  }

  getShortState() {
    const shortState = {
      heroes: this.state.heroes,
      enemies: this.state.enemies.map(enemy => ({
        id: enemy.id,
        name: enemy.name,
        role: enemy.role,
        stats: {
          health: enemy.stats.health,
          stamina: enemy.stats.stamina,
          attack: enemy.stats.attack,
          defense: enemy.stats.defense,
          accuracy: enemy.stats.accuracy,
          evasion: enemy.stats.evasion,
        }
      })),
      turnOrder: this.state.turnOrder,
      effectsQueue: this.state.effectsQueue,
      currentPlayer: this.state.currentPlayer,
      isGameOver: this.state.isGameOver
    };

    return shortState;
  }

  getState() {
    return this.state;
  }

  setEnemyMoviment(moviment: { actionIndex: number; targetId: string; } | null) {
    this.enemyMoviment = moviment;
  }

  getId() {
    return this.id;
  }

  applyAction(actionIdx: number, targetId: string) {
    let player = [...this.state.heroes, ...this.state.enemies].find(char => char.id === this.state.currentPlayer);

    if (!player) {
      console.error("No current player found!");
      return;
    }

    let ability = player.abilities[actionIdx];

    if (ability.isBlocked) {
      console.error("Ability is blocked due to insufficient stamina!");
      return;
    }

    let target = [...this.state.heroes, ...this.state.enemies].find(char => char.id === targetId);


    if (!target) {
      console.error("Target not found!");
      return;
    }

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

  getAbilityCooldown(playerId: string, abilityId: string) {
    return (this.state.abilitiesCooldowns[playerId] && this.state.abilitiesCooldowns[playerId][abilityId]) || 0;
  }

  setCooldown(playerId: string, abilityId: string, cooldown: number) {
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

  removeCharacter(playerId: string) {
    this.state.heroes = this.state.heroes.filter(hero => hero.id !== playerId);
    this.state.enemies = this.state.enemies.filter(enemy => enemy.id !== playerId);
    this.state.turnOrder = this.state.turnOrder.filter(id => id !== playerId);
  }

  nextTurn() {
    if (!this.state.currentPlayer) {
      console.error("No current player to proceed turn!");
      return;
    }

    const currentIndex = this.state.turnOrder.indexOf(this.state.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.state.turnOrder.length;
    this.state.currentPlayer = this.state.turnOrder[nextIndex];
    this.applyEffects();
    this.removeCooldowns();
    this.checkAvailableActions();
    this.checkGameOver();
  }

  checkGameOver() {
    if (!this.state.heroes.length || !this.state.enemies.length) {
      this.state.isGameOver = true;
    }
  }

  checkIsEnemyTurn() {
    const currentPlayer = [...this.state.heroes, ...this.state.enemies].find(char => char.id === this.state.currentPlayer);
    if (currentPlayer) {
      return this.state.enemies.some(enemy => enemy.id === currentPlayer.id);
    }
    return false;
  }

  initializeTurnOrder() {
    this.state.turnOrder = [...this.state.heroes, ...this.state.enemies].sort((a, b) => b.stats.velocity - a.stats.velocity).map((char) => char.id);
    this.state.currentPlayer = this.state.turnOrder[0];
  }
}