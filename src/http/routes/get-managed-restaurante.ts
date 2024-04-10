import Elysia from 'elysia'

import { db } from '@/db/connection'

import { NotAManagerError } from '../errors/not-a-manager-error'

import { auth } from '../auth'

export const getManagedRestaurante = new Elysia()
  .use(auth)
  .get('/managed-restaurante', async ({ getCurrentUser }) => {
    const { restauranteId } = await getCurrentUser()

    if (!restauranteId) {
      throw new NotAManagerError()
    }

    const managedRestaurante = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, restauranteId)
      },
    })

    if (!managedRestaurante) {
      throw new Error('Restaurante not found.')
    }

    return managedRestaurante
  })
