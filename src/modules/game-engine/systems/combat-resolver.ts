import type { Character, State } from "@/modules/game-engine/types";
import type { CooldownSystem } from "@/modules/game-engine/systems/cooldown-system";
import type { EventBus } from "@/modules/game-engine/events/event-bus";
import type { GameEvents } from "@/modules/game-engine/events/game-events";

type CombatPatch = Pick<State, 'heroes' | 'enemies' | 'effectsQueue' | 'abilitiesCooldowns'>;

interface CombatResult {
  patch: CombatPatch;
  deadCharacterId: string | null;
}

export class CombatResolver {
  constructor(
    private readonly cooldowns: CooldownSystem,
    private readonly bus?: EventBus<GameEvents>
  ) {}

  resolve(state: Readonly<State>, actionIdx: number, targetId: string): CombatResult | null {
    const allChars = [...state.heroes, ...state.enemies];

    const player = allChars.find(c => c.id === state.currentPlayer);
    if (!player) {
      console.error("No current player found!");
      return null;
    }

    const ability = player.abilities[actionIdx];
    if (!ability) {
      console.error("Ability not found!");
      return null;
    }

    if (ability.isBlocked) {
      console.error("Ability is blocked due to cooldown or insufficient stamina!");
      return null;
    }

    const target = allChars.find(c => c.id === targetId);
    if (!target) {
      console.error("Target not found!");
      return null;
    }

    const updatedPlayer: Character = {
      ...player,
      stats: { ...player.stats, stamina: player.stats.stamina - ability.staminaCost },
    };
    const updatedTarget: Character = {
      ...target,
      stats: { ...target.stats, health: target.stats.health - ability.value },
    };

    const replaceChar = (chars: readonly Character[], updated: Character): Character[] =>
      chars.map(c => c.id === updated.id ? updated : c);

    const newEffectsQueue: State['effectsQueue'] = ability.effects
      ? [
          ...state.effectsQueue,
          ...ability.effects.map(effect => ({ targetId: target.id, effect, remainingDuration: effect.duration })),
        ]
      : [...state.effectsQueue];

    let newCooldowns = state.abilitiesCooldowns;
    if (ability.cooldown > 0) {
      newCooldowns = this.cooldowns.setCooldown(state, player.id, ability.id, ability.cooldown).abilitiesCooldowns;
    }

    this.bus?.emit('ability:used', { playerId: player.id, abilityId: ability.id, targetId: target.id });
    this.bus?.emit('character:damaged', { characterId: target.id, damage: ability.value, remainingHealth: updatedTarget.stats.health });

    const deadCharacterId = updatedTarget.stats.health <= 0 ? updatedTarget.id : null;
    if (deadCharacterId) this.bus?.emit('character:died', { characterId: deadCharacterId });

    const heroesWithPlayer = replaceChar(state.heroes, updatedPlayer);
    const heroesWithTarget = replaceChar(heroesWithPlayer, updatedTarget);
    const enemiesWithPlayer = replaceChar(state.enemies, updatedPlayer);
    const enemiesWithTarget = replaceChar(enemiesWithPlayer, updatedTarget);

    return {
      patch: {
        heroes: heroesWithTarget,
        enemies: enemiesWithTarget,
        effectsQueue: newEffectsQueue,
        abilitiesCooldowns: newCooldowns,
      },
      deadCharacterId,
    };
  }
}
