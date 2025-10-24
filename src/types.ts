export interface Effect {
  attribute: "health" | "stamina" | "attack" | "defense" | "accuracy" | "evasion" | "velocity";
  value: number;
  duration: number;
}

export interface Ability {
  id: string;
  name: string;
  type: "melee" | "ranged" | "support";
  value: number;
  staminaCost: number;
  cooldown: number;
  isBlocked: boolean;
  target: "enemy-single" | "enemy-all" | "ally-single" | "ally-all" | "self";
  effects?: Effect[];
}

export interface Character {
  id: string;
  name: string;
  role: string;
  stats: {
    health: number;
    stamina: number;
    attack: number;
    defense: number;
    accuracy: number;
    evasion: number;
    velocity: number;
  };
  abilities: Ability[];
}

export interface State {
  heroes: Character[];
  enemies: Character[];
  currentPlayer: string | null;
  turnOrder: string[];
  isGameOver: boolean;
  effectsQueue: { targetId: string; effect: Effect; remainingDuration: number }[];
  abilitiesCooldowns: { [characterId: string]: { [abilityId: string]: number } };
}