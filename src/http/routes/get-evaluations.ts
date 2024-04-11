import Elysia, { t } from 'elysia'

import { db } from '@/db/connection'

import { NotAManagerError } from './errors/not-a-manager-error'

import { auth } from '../auth'

export const getEvaluations = new Elysia().use(auth).get(
  '/evaluations',
  async ({ query, getCurrentUser }) => {
    const { pageIndex } = query
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new NotAManagerError()
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
