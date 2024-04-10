import { and, eq, inArray } from 'drizzle-orm'
import Elysia, { Static, t } from 'elysia'

import { db } from '@/db/connection'
import { products } from '@/db/schema'

import { UnauthorizedError } from '../errors/unauthorized-error'

import { auth } from '../auth'

const productSchema = t.Object({
  id: t.Optional(t.String()),
  name: t.String(),
  description: t.Optional(t.String()),
  price: t.Number({ minimum: 0 }),
})

export const updateMenu = new Elysia().use(auth).put(
  '/menu',
  async ({ getCurrentUser, set, body }) => {
    const { restauranteId } = await getCurrentUser()

    if (!restauranteId) {
      throw new UnauthorizedError()
    }

    const {
      products: { deletedProductIds, newOrUpdatedProducts },
    } = body

    if (deletedProductIds.length > 0) {
      await db
        .delete(products)
        .where(
          and(
            inArray(products.id, deletedProductIds),
            eq(products.restaurantId, restauranteId),
          ),
        )
    }

    type Product = Static<typeof productSchema>
    type ProductWithId = Required<Product>
    type ProductWithoutId = Omit<Product, 'id'>

    const updatedProducts = newOrUpdatedProducts.filter(
      (product): product is ProductWithId => {
        return !!product.id
      },
    )

    if (updatedProducts.length > 0) {
      await Promise.all(
        updatedProducts.map((product) => {
          return db
            .update(products)
            .set({
              name: product.name,
              description: product.description,
              priceInCents: product.price * 100,
            })
            .where(
              and(
                eq(products.id, product.id),
                eq(products.restaurantId, restauranteId),
              ),
            )
        }),
      )
    }

    const newProducts = newOrUpdatedProducts.filter(
      (product): product is ProductWithoutId => {
        return !product.id
      },
    )

    if (newProducts.length) {
      await db.insert(products).values(
        newProducts.map((product) => {
          return {
            name: product.name,
            description: product.description,
            priceInCents: product.price * 100,
            restaurantId: restauranteId,
          }
        }),
      )
    }

    set.status = 204
  },
  {
    body: t.Object({
      products: t.Object({
        newOrUpdatedProducts: t.Array(productSchema),
        deletedProductIds: t.Array(t.String()),
      }),
    }),
  },
)
