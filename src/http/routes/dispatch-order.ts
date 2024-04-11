import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

import { UnauthorizedError } from './errors/unauthorized-error'

import { db } from '@/db/connection'
import { orders } from '@/db/schema'

import { auth } from '../auth'

export const dispatchOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/dispatch',
  async ({ getManagedRestaurantId, set, params }) => {
    const { orderId } = params
    const restaurantId = await getManagedRestaurantId()

    const order = await db.query.orders.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, orderId),
          eq(fields.restaurantId, restaurantId),
        )
      },
    })

    if (!order) {
      throw new UnauthorizedError()
    }

    if (order.status !== 'processing') {
      set.status = 400

      return { message: 'O pedido já foi enviado ao cliente.' }
    }

    await db
      .update(orders)
      .set({ status: 'delivering' })
      .where(eq(orders.id, orderId))

    set.status = 204
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
