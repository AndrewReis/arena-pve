import type { Character, State } from "@/modules/game-engine/types";
import type { EventBus } from "@/modules/game-engine/events/event-bus";
import type { GameEvents } from "@/modules/game-engine/events/game-events";

export class TurnManager {
  constructor(private readonly bus?: EventBus<GameEvents>) {}

  initializeTurnOrder(characters: Character[]): Pick<State, 'turnOrder' | 'currentPlayer'> {
    const turnOrder = characters
      .slice()
      .sort((a, b) => b.stats.velocity - a.stats.velocity)
      .map(c => c.id);
    return { turnOrder, currentPlayer: turnOrder[0] ?? null };
  }

  nextTurn(state: Readonly<State>): Pick<State, 'currentPlayer'> {
    if (!state.currentPlayer) return { currentPlayer: null };

    const currentIndex = state.turnOrder.indexOf(state.currentPlayer);
    const safeIndex = Math.max(0, currentIndex);
    const nextIndex = (safeIndex + 1) % state.turnOrder.length;
    const currentPlayer = state.turnOrder[nextIndex] ?? null;

    if (currentPlayer) {
      this.bus?.emit('turn:changed', { currentPlayerId: currentPlayer });
    }

    return { currentPlayer };
  }

  removeCharacter(state: Readonly<State>, playerId: string): Pick<State, 'heroes' | 'enemies' | 'turnOrder'> {
    return {
      heroes: state.heroes.filter(h => h.id !== playerId),
      enemies: state.enemies.filter(e => e.id !== playerId),
      turnOrder: state.turnOrder.filter(id => id !== playerId),
    };
  }

  checkGameOver(state: Readonly<State>): Pick<State, 'isGameOver'> {
    if (!state.heroes.length || !state.enemies.length) {
      const winner = state.heroes.length ? 'heroes' : 'enemies';
      this.bus?.emit('game:over', { winner });
      return { isGameOver: true };
    }
    return { isGameOver: false };
  }

  checkIsEnemyTurn(state: Readonly<State>): boolean {
    const current = [...state.heroes, ...state.enemies].find(c => c.id === state.currentPlayer);
    return current ? state.enemies.some(e => e.id === current.id) : false;
  }
}
