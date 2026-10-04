import 'dotenv/config';
import fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

import path from 'node:path';
import crypto from 'node:crypto';

import { DATA_BASE_CHARACTERS } from './fakedb';
import { GameEngine } from './game';
import { AIService } from './ai-service';

const database = new Map<string, GameEngine>();

export function buildApp({ enableStatic = false }: { enableStatic?: boolean } = {}): FastifyInstance {
  const server = fastify({ logger: false });

  server.register(cors, { origin: '*' });

  if (enableStatic) {
    // Load this plugin only for the local server. Its dependency graph is not
    // needed by the Lambda API and includes ESM-only packages.
    const fastifyStatic = require('@fastify/static');
    server.register(fastifyStatic, {
      root: path.join(__dirname, '..', 'public')
    });
  }

  server.get('/health-check', async (_request, reply) => {
    return reply.send({ status: 'ok' });
  });

  server.post('/game', async (_request, reply) => {
    const gameEngine = new GameEngine({
      heroes: structuredClone(DATA_BASE_CHARACTERS.slice(0, 3)),
      enemies: structuredClone(DATA_BASE_CHARACTERS.slice(3, 6)),
      id: crypto.randomUUID()
    });

    database.set(gameEngine.getId(), gameEngine);

    return reply.status(201).send({
      id: gameEngine.getId(),
      state: gameEngine.getShortState()
    });
  });

  server.get('/game/:gameId/state', async (request, reply) => {
    const { gameId } = request.params as { gameId: string };
    const gameEngine = database.get(gameId);

    if (!gameEngine) {
      return reply.status(404).send({ error: 'Game not found' });
    }

    return reply.send({ id: gameEngine.getId(), state: gameEngine.getShortState() });
  });

  server.post('/game/:gameId/apply-action', async (request, reply) => {
    const { gameId } = request.params as { gameId: string };
    const { targetId, ability } = request.body as { targetId: string; ability: number };
    const gameEngine = database.get(gameId);

    if (!gameEngine) {
      return reply.status(404).send({ error: 'Game not found' });
    }

    const aiService = new AIService(gameEngine.getState());
    gameEngine.applyAction(ability, targetId);
    let aiResponse: { actionIndex: number; targetId: string } | null = null;

    if (gameEngine.checkIsEnemyTurn()) {
      aiResponse = await aiService.sendPromptToAI(aiService.generatePrompt());
      gameEngine.setEnemyMoviment(aiResponse);
    }

    return reply.send({ id: gameEngine.getId(), state: gameEngine.getShortState(), enemyMoviment: aiResponse });
  });

  return server;
}
