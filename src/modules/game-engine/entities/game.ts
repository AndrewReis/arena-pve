import type { Character, State } from "@/modules/game-engine/types";
import { CooldownSystem }   from "@/modules/game-engine/systems/cooldown-system";
import { EffectProcessor }  from "@/modules/game-engine/systems/effect-processor";
import { AbilityValidator } from "@/modules/game-engine/systems/ability-validator";
import { CombatResolver }   from "@/modules/game-engine/systems/combat-resolver";
import { TurnManager }      from "@/modules/game-engine/systems/turn-manager";
import { EventBus }         from "@/modules/game-engine/events/event-bus";
import type { GameEvents }  from "@/modules/game-engine/events/game-events";

export class GameEngine {
  private readonly id: string;
  private enemyMoviment: { actionIndex: number; targetId: string } | null = null;
  private state: State = {
    heroes: [],
    enemies: [],
    currentPlayer: null,
    turnOrder: [],
    isGameOver: false,
    effectsQueue: [],
    abilitiesCooldowns: {},
  };

  readonly bus = new EventBus<GameEvents>();

  private readonly cooldowns  = new CooldownSystem();
  private readonly effects    = new EffectProcessor(this.bus);
  private readonly validator  = new AbilityValidator();
  private readonly combat     = new CombatResolver(this.cooldowns, this.bus);
  private readonly turn       = new TurnManager(this.bus);

  constructor({ heroes, enemies, id }: { heroes: Character[]; enemies: Character[]; id: string }) {
    this.id = id;
    this.state = {
      ...this.state,
      heroes,
      enemies,
      ...this.turn.initializeTurnOrder([...heroes, ...enemies]),
    };
  }

  getShortState() {
    return {
      heroes: this.state.heroes,
      enemies: this.state.enemies.map(enemy => ({
        id: enemy.id,
        name: enemy.name,
        role: enemy.role,
        stats: {
          health:   enemy.stats.health,
          stamina:  enemy.stats.stamina,
          attack:   enemy.stats.attack,
          defense:  enemy.stats.defense,
          accuracy: enemy.stats.accuracy,
          evasion:  enemy.stats.evasion,
        },
      })),
      turnOrder:     this.state.turnOrder,
      effectsQueue:  this.state.effectsQueue,
      currentPlayer: this.state.currentPlayer,
      isGameOver:    this.state.isGameOver,
    };
  }

  getState(): State {
    return this.state;
  }

  getId(): string {
    return this.id;
  }

  setEnemyMoviment(moviment: { actionIndex: number; targetId: string } | null): void {
    this.enemyMoviment = moviment;
  }

  applyAction(actionIdx: number, targetId: string): void {
    const combatResult = this.combat.resolve(this.state, actionIdx, targetId);
    if (combatResult === null) return;

    this.state = { ...this.state, ...combatResult.patch };

    if (combatResult.deadCharacterId !== null) {
      this.state = { ...this.state, ...this.turn.removeCharacter(this.state, combatResult.deadCharacterId) };
    }

    this.state = { ...this.state, ...this.turn.nextTurn(this.state) };
    this.state = { ...this.state, ...this.effects.applyEffects(this.state) };
    this.state = { ...this.state, ...this.cooldowns.removeCooldowns(this.state) };
    this.state = { ...this.state, ...this.validator.checkAvailableActions(this.state) };
    this.state = { ...this.state, ...this.turn.checkGameOver(this.state) };
  }

  checkIsEnemyTurn(): boolean {
    return this.turn.checkIsEnemyTurn(this.state);
  }
}
