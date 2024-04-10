import Elysia from 'elysia'

import { UnauthorizedError } from '../errors/unauthorized-error'

import { db } from '@/db/connection'

import { auth } from '../auth'

export const getProfile = new Elysia()
  .use(auth)
  .get('/me', async ({ getCurrentUser }) => {
    const { userId, restauranteId } = await getCurrentUser()

    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userId)
      },
    })

    if (!user) {
      throw new UnauthorizedError()
    }

    return user
  })
