import { Character } from "./game";

export const DATA_BASE_CHARACTERS: Character[] = [
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
    id: "thanos",
    name: "Thanos",
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
    id: "red_skull",
    name: "Red Skull",
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
    id: "ultron",
    name: "Ultron",
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