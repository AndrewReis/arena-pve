import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors'

import path from 'node:path';
import crypto from 'node:crypto';

import { DATA_BASE_CHARACTERS } from './fakedb';
import { GameEngine } from './game';

const server = fastify({
  logger: false
});

server.register(cors, {
  origin: '*'
})

server.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public')
});

const database = new Map<string, GameEngine>();

server.post('/game', async (request, reply) => {
  const gameEngine = new GameEngine({
    heroes: [DATA_BASE_CHARACTERS[0], DATA_BASE_CHARACTERS[1], DATA_BASE_CHARACTERS[2]],
    enemies: [DATA_BASE_CHARACTERS[3], DATA_BASE_CHARACTERS[4], DATA_BASE_CHARACTERS[5]],
    id: crypto.randomUUID()
  });

  database.set(gameEngine.getId(), gameEngine);

  return reply.status(201).send({
    id: gameEngine.getId(),
    state: gameEngine.getState()
  });
});

server.get('/game/:gameId/state', async (request, reply) => {
  const { gameId } = request.params as { gameId: string };
  const gameEngine = database.get(gameId);

  if (!gameEngine) {
    return reply.status(404).send({ error: 'Game not found' });
  }

  return reply.send({
    id: gameEngine.getId(),
    state: gameEngine.getState()
  });
});

server.post('/game/:gameId/apply-action', async (request, reply) => {
  const { gameId } = request.params as { gameId: string };
  const { targetId, ability } = (request.body) as { targetId: string; ability: number };

  const gameEngine = database.get(gameId);

  if (!gameEngine) {
    return reply.status(404).send({ error: 'Game not found' });
  }

  gameEngine.applyAction(ability, targetId);

  return reply.send({
    id: gameEngine.getId(),
    state: gameEngine.getState()
  });
});

const start = async () => {
  try {
    const port = 3000;
    await server.listen({ port: port, host: '0.0.0.0' });
    console.log(`Servidor rodando em http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();