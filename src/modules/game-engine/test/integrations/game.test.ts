import { describe, expect, it, beforeAll } from 'vitest'

import { app } from '@/app'

describe('Game', () => {
  beforeAll(async () => {
    await app.ready()
  });

  it('should be able to create a new game', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/game',
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        state: expect.objectContaining({
          heroes: expect.any(Array),
          enemies: expect.any(Array),
          turnOrder: expect.any(Array),
        }),
      }),
    )
  })
})