import Elysia, { t } from 'elysia'

import { db } from '@/db/connection'

export const getEvaluations = new Elysia().get(
  '/evaluations',
  async ({ query }) => {
    const { pageIndex } = query

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
