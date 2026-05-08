import 'dotenv/config';

import fastify       from 'fastify';
import fastifyStatic from '@fastify/static';
import cors          from '@fastify/cors'
import { fileURLToPath } from 'node:url';
import path          from 'node:path';
import crypto        from 'node:crypto';

import { DATA_BASE_CHARACTERS } from '@/fakedb';

import { GameEngine } from '@/modules/game-engine/entities/game';
import { AIService } from '@/ai-service';

const publicDirectory = path.join(fileURLToPath(new URL('.', import.meta.url)), '..', 'public');

const app = fastify({
  logger: false
});

app.register(cors, {
  origin: '*'
})

app.register(fastifyStatic, {
  root: publicDirectory
});

const database = new Map<string, GameEngine>();

app.post('/game', async (request, reply) => {
  const gameEngine = new GameEngine({
    heroes: [DATA_BASE_CHARACTERS[0]!, DATA_BASE_CHARACTERS[1]!, DATA_BASE_CHARACTERS[2]!],
    enemies: [DATA_BASE_CHARACTERS[3]!, DATA_BASE_CHARACTERS[4]!, DATA_BASE_CHARACTERS[5]!],
    id: crypto.randomUUID()
  });

  database.set(gameEngine.getId(), gameEngine);

  return reply.status(201).send({
    id: gameEngine.getId(),
    state: gameEngine.getShortState()
  });
});

app.get('/game/:gameId/state', async (request, reply) => {
  const { gameId } = request.params as { gameId: string };
  const gameEngine = database.get(gameId);

  if (!gameEngine) {
    return reply.status(404).send({ error: 'Game not found' });
  }

  return reply.send({
    id: gameEngine.getId(),
    state: gameEngine.getShortState()
  });
});

app.post('/game/:gameId/apply-action', async (request, reply) => {
  const { gameId } = request.params as { gameId: string };
  const { targetId, ability } = (request.body) as { targetId: string; ability: number };

  const gameEngine = database.get(gameId);

  if (!gameEngine) {
    return reply.status(404).send({ error: 'Game not found' });
  }

  const aiService = new AIService(gameEngine.getState());

  gameEngine.applyAction(ability, targetId);

  let aiResponse: { actionIndex: number; targetId: string; } | null = null;

  if (gameEngine.checkIsEnemyTurn()) {
    const prompt = aiService.generatePrompt();
    aiResponse = await aiService.sendPromptToAI(prompt);
    gameEngine.setEnemyMoviment(aiResponse);
  }

  return reply.send({
    id: gameEngine.getId(),
    state: gameEngine.getShortState(),
    enemyMoviment: aiResponse || null
  });
});

export {
  app
}