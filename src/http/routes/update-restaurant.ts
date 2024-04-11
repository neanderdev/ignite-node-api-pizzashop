import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

import { db } from '@/db/connection'
import { restaurants } from '@/db/schema'

import { auth } from '../auth'

export const updateRestaurant = new Elysia().use(auth).put(
  '/restaurants',
  async ({ getManagedRestaurantId, set, body }) => {
    const { name, description } = body
    const restaurantId = await getManagedRestaurantId()

    await db
      .update(restaurants)
      .set({
        name,
        description,
      })
      .where(eq(restaurants.id, restaurantId))

    set.status = 204
  },
  {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
    }),
  },
)
