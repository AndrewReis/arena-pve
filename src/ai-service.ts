import OpenAI from "openai";

import { State } from "./types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export class AIService {
  private openai: OpenAI | null = null;
  private state: State = {
    heroes: [],
    enemies: [],
    currentPlayer: null,
    turnOrder: [],
    isGameOver: false,
    effectsQueue: [],
    abilitiesCooldowns: {}
  };

  constructor(state: State) {
    this.state = state;

    if (OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    } else {
      console.warn("[AIService] OPENAI_API_KEY not set. Falling back to local heuristic for enemy moves.")
    }
  }

  generatePrompt() {
    const prompt = `
      You are an AI controlling enemy units in a turn-based RPG similar to Marvel Avengers Alliance.

      Your goal is to choose the most strategic move for the current enemy's turn.

      --- GAME STATE ---
      ${JSON.stringify({
      heroes: this.state.heroes.map(h => ({
        id: h.id,
        name: h.name,
        health: h.stats.health,
        stamina: h.stats.stamina,
        attack: h.stats.attack,
        defense: h.stats.defense,
      })),
      enemies: this.state.enemies.map(e => ({
        id: e.id,
        name: e.name,
        health: e.stats.health,
        stamina: e.stats.stamina,
        abilities: e.abilities.map(a => ({
          name: a.name,
          type: a.type,
          cost: a.staminaCost,
          cooldown: a.cooldown,
          isBlocked: a.isBlocked,
          effects: a.effects?.map(eff => eff.attribute),
        })),
      })),
      currentPlayer: this.state.currentPlayer,
      turnOrder: this.state.turnOrder,
      isGameOver: this.state.isGameOver,
    }, null, 2)}

      --- STRATEGY RULES ---
      - Attack weakest heroes (lowest health) if possible.
      - If allies are low health, consider healing or buffing them.
      - Avoid using abilities on cooldown or blocked.
      - Prefer attacks that can finish off weakened heroes.
      - Use buffs/debuffs when they provide clear advantage.
      - Do not target defeated units (health <= 0).

      --- OUTPUT FORMAT ---
      Respond only in valid JSON:
      {
        "actionIndex": <number>,
        "targetId": "<string>"
      }
  `;

    return prompt;
  }

  private fallbackAIResponse(): { actionIndex: number; targetId: string } {
    console.log("[AIService] Using fallback AI response.");
    const currentEnemy = this.state.enemies.find(e => e.id === this.state.currentPlayer) || this.state.enemies[0];
    const actionIndex = currentEnemy?.abilities.findIndex(a => !a.isBlocked) ?? 0;
    const target = [...this.state.heroes]
      .filter(h => h.stats.health > 0)
      .sort((a, b) => a.stats.health - b.stats.health)[0];
    return { actionIndex: Math.max(0, actionIndex), targetId: target?.id || this.state.heroes[0]?.id || "" };
  }

  async sendPromptToAI(prompt: string): Promise<{ actionIndex: number; targetId: string }> {
    if (!this.openai) {
      return this.fallbackAIResponse();
    }

    try {
      const messages = [
        { role: "system" as const, content: "You are a game AI helping choose optimal enemy moves. Respond ONLY with JSON as specified." },
        { role: "user" as const, content: prompt }
      ];

      const completion = await this.openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.2,
        response_format: { type: "json_object" as const }
      });

      const content = completion.choices?.[0]?.message?.content?.trim() || "";
      let parsed: any = {};
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        console.warn("[AIService] Failed to parse AI JSON. Content was:", content);
      }

      const actionIndex = Number.isInteger(parsed?.actionIndex) ? parsed.actionIndex : 0;
      const targetId = typeof parsed?.targetId === "string" ? parsed.targetId : (this.state.heroes[0]?.id || "");

      console.log("[AIService] AI selected action:", { actionIndex, targetId });
      return { actionIndex, targetId };
    } catch (err) {
      console.error("[AIService] OpenAI request failed:", err);
      return this.fallbackAIResponse();
    }
  }
}