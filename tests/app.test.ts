import { afterEach, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app';

describe('HTTP API', () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it('returns a healthy status', async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/health-check' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('creates a game and returns its state', async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({ method: 'POST', url: '/game' });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.id).toEqual(expect.any(String));
    expect(body.state.heroes).toHaveLength(3);
    expect(body.state.enemies).toHaveLength(3);
  });

  it('returns 404 for an unknown game', async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/game/unknown/state' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'Game not found' });
  });
});
