import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

import { db } from '@/db/connection'
import { restaurants } from '@/db/schema'

import { UnauthorizedError } from '../errors/unauthorized-error'

import { auth } from '../auth'

export const updateRestaurant = new Elysia().use(auth).put(
  '/restaurants',
  async ({ getCurrentUser, set, body }) => {
    const { restauranteId } = await getCurrentUser()
    const { name, description } = body

    if (!restauranteId) {
      set.status = 401

      throw new UnauthorizedError()
    }

    await db
      .update(restaurants)
      .set({
        name,
        description,
      })
      .where(eq(restaurants.id, restauranteId))

    set.status = 204
  },
  {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
    }),
  },
)
