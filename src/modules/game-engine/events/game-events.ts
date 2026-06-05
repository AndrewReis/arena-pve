export type GameEvents = {
  'ability:used':      { playerId: string; abilityId: string; targetId: string };
  'character:damaged': { characterId: string; damage: number; remainingHealth: number };
  'character:died':    { characterId: string };
  'effect:applied':    { characterId: string; attribute: string; value: number };
  'turn:changed':      { currentPlayerId: string };
  'game:over':         { winner: 'heroes' | 'enemies' };
};
