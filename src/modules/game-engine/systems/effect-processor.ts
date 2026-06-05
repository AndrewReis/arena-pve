import type { Character, State } from "@/modules/game-engine/types";
import type { EventBus } from "@/modules/game-engine/events/event-bus";
import type { GameEvents } from "@/modules/game-engine/events/game-events";

export class EffectProcessor {
  constructor(private readonly bus?: EventBus<GameEvents>) {}

  applyEffects(state: Readonly<State>): Pick<State, 'heroes' | 'enemies' | 'effectsQueue'> {
    const allChars = [...state.heroes, ...state.enemies];
    const statDeltas = new Map<string, Partial<Character['stats']>>();
    const nextQueue: State['effectsQueue'] = [];

    for (const entry of state.effectsQueue) {
      const target = allChars.find(c => c.id === entry.targetId);
      if (!target) continue;

      const delta = statDeltas.get(target.id) ?? {};
      const prev = (delta[entry.effect.attribute] ?? 0);
      delta[entry.effect.attribute] = prev + entry.effect.value;
      statDeltas.set(target.id, delta);

      this.bus?.emit('effect:applied', {
        characterId: target.id,
        attribute: entry.effect.attribute,
        value: entry.effect.value,
      });

      const newDuration = entry.remainingDuration - 1;
      if (newDuration > 0) {
        nextQueue.push({ ...entry, remainingDuration: newDuration });
      }
    }

    const applyDelta = (char: Character): Character => {
      const delta = statDeltas.get(char.id);
      if (!delta) return char;
      return { ...char, stats: { ...char.stats, ...Object.fromEntries(
        Object.entries(delta).map(([k, v]) => [k, char.stats[k as keyof Character['stats']] + (v ?? 0)])
      )} };
    };

    return {
      heroes: state.heroes.map(applyDelta),
      enemies: state.enemies.map(applyDelta),
      effectsQueue: nextQueue,
    };
  }
}
