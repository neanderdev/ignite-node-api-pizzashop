import { createId } from '@paralleldrive/cuid2'
import Elysia, { t } from 'elysia'
// import nodemailer from 'nodemailer'

import { UnauthorizedError } from '../errors/unauthorized-error'

import { db } from '@/db/connection'
import { authLinks } from '@/db/schema'
import { env } from '@/env'
// import { mail } from '@/lib/mail'
import { resend } from '@/mail/client'
import { AuthenticationMagicLinkTemplate } from '@/mail/templates/authentication-magic-link'

export const sendAuthLink = new Elysia().post(
  '/authenticate',
  async ({ body }) => {
    const { email } = body

    const userFromEmail = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    if (!userFromEmail) {
      throw new UnauthorizedError()
    }

    const authLinkCode = createId()

    await db.insert(authLinks).values({
      userId: userFromEmail.id,
      code: authLinkCode,
    })

    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)

    authLink.searchParams.set('code', authLinkCode)
    authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL)

    await resend.emails.send({
      from: 'Pizza Shop <naoresponda@fala.dev>',
      to: email,
      subject: '[Pizza Shop] Link para login',
      react: AuthenticationMagicLinkTemplate({
        userEmail: email,
        authLink: authLink.toString(),
      }),
    })

    // const info = await mail.sendMail({
    //   from: {
    //     name: 'Pizza Shop',
    //     address: 'hi@pizzashop.com',
    //   },
    //   to: email,
    //   subject: 'Authenticate to Pizza Shop',
    //   text: `Use the following link to authenticate on Pizza Shop: ${authLink.toString()}`,
    // })

    // console.log(nodemailer.getTestMessageUrl(info))
  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
    }),
  },
)
