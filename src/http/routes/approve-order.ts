import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

import { UnauthorizedError } from '../errors/unauthorized-error'

import { db } from '@/db/connection'
import { orders } from '@/db/schema'

import { auth } from '../auth'

export const approveOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/approve',
  async ({ getCurrentUser, set, params }) => {
    const { orderId } = params
    const { restauranteId } = await getCurrentUser()

    if (!restauranteId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, orderId),
          eq(fields.restaurantId, restauranteId),
        )
      },
    })

    if (!order) {
      throw new UnauthorizedError()
    }

    if (order.status !== 'pending') {
      set.status = 400

      return { message: 'Order was already approved before.' }
    }

    await db
      .update(orders)
      .set({ status: 'processing' })
      .where(eq(orders.id, orderId))
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
