import type { Character, State } from "@/modules/game-engine/types";

export class AbilityValidator {
  checkAvailableActions(state: Readonly<State>): Pick<State, 'heroes' | 'enemies'> {
    const mapChar = (char: Character): Character => ({
      ...char,
      abilities: char.abilities.map(a => ({
        ...a,
        isBlocked: (state.abilitiesCooldowns[char.id]?.[a.id] ?? 0) > 0 || char.stats.stamina < a.staminaCost,
      })),
    });

    return {
      heroes: state.heroes.map(mapChar),
      enemies: state.enemies.map(mapChar),
    };
  }
}
