import Elysia, { t } from 'elysia'

import { db } from '@/db/connection'

import { auth } from '../auth'

export const getEvaluations = new Elysia().use(auth).get(
  '/evaluations',
  async ({ query, set, getCurrentUser }) => {
    const { pageIndex } = query
    const { restauranteId } = await getCurrentUser()

    if (!restauranteId) {
      set.status = 401

      throw new Error('User is not a restaurant manager.')
    }

    const evaluations = await db.query.evaluations.findMany({
      offset: pageIndex * 10,
      limit: 10,
      orderBy: (evaluations, { desc }) => desc(evaluations.createdAt),
    })

    return evaluations
  },
  {
    query: t.Object({
      pageIndex: t.Numeric({ minimum: 0, default: 0 }),
    }),
  },
)
