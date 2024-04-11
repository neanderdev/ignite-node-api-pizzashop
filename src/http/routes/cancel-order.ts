import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

import { NotAManagerError } from './errors/not-a-manager-error'

import { db } from '@/db/connection'
import { orders } from '@/db/schema'

import { auth } from '../auth'

export const cancelOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/cancel',
  async ({ getCurrentUser, set, params }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new NotAManagerError()
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, orderId),
          eq(fields.restaurantId, restaurantId),
        )
      },
    })

    if (!order) {
      set.status = 401

      throw new Error('Order not found under the user managed restaurant.')
    }

    if (!['pending', 'processing'].includes(order.status)) {
      set.status = 400

      return {
        code: 'STATUS_NOT_VALID',
        message: 'O pedido não pode ser cancelado depois de ser enviado.',
      }
    }

    await db
      .update(orders)
      .set({ status: 'canceled' })
      .where(eq(orders.id, orderId))

    set.status = 204
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
