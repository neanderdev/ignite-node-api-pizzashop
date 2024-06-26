import Elysia from 'elysia'

import { db } from '@/db/connection'

import { auth } from '../auth'

export const getProfile = new Elysia()
  .use(auth)
  .get('/me', async ({ getCurrentUser }) => {
    const { customerId } = await getCurrentUser()

    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, customerId)
      },
    })

    if (!user) {
      throw new Error('User not found.')
    }

    return user
  })
