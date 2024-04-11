import Elysia, { t } from 'elysia'

import { db } from '@/db/connection'
import { users } from '@/db/schema'

export const registerCustomer = new Elysia().post(
  '/customers',
  async ({ body, set }) => {
    const { name, phone, email } = body

    await db.insert(users).values({
      name,
      email,
      phone,
    })

    set.status = 201
  },
  {
    body: t.Object({
      name: t.String({ minLength: 4 }),
      email: t.String({ format: 'email' }),
      phone: t.String(),
    }),
  },
)
