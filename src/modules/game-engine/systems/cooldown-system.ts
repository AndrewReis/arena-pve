import type { State } from "@/modules/game-engine/types";

export class CooldownSystem {
  getAbilityCooldown(state: Readonly<State>, playerId: string, abilityId: string): number {
    return state.abilitiesCooldowns[playerId]?.[abilityId] ?? 0;
  }

  setCooldown(
    state: Readonly<State>,
    playerId: string,
    abilityId: string,
    cooldown: number
  ): Pick<State, 'abilitiesCooldowns'> {
    return {
      abilitiesCooldowns: {
        ...state.abilitiesCooldowns,
        [playerId]: { ...state.abilitiesCooldowns[playerId], [abilityId]: cooldown },
      },
    };
  }

  removeCooldowns(state: Readonly<State>): Pick<State, 'abilitiesCooldowns'> {
    const next: State['abilitiesCooldowns'] = {};

    for (const charId of Object.keys(state.abilitiesCooldowns)) {
      const cooldowns = state.abilitiesCooldowns[charId];
      if (!cooldowns) continue;

      const updated: { [abilityId: string]: number } = {};
      for (const abilityId of Object.keys(cooldowns)) {
        const remaining = cooldowns[abilityId];
        if (remaining === undefined) continue;
        const nextVal = remaining - 1;
        if (nextVal > 0) updated[abilityId] = nextVal;
      }

      if (Object.keys(updated).length > 0) next[charId] = updated;
    }

    return { abilitiesCooldowns: next };
  }
}
