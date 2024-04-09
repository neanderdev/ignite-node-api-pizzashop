import { Elysia } from 'elysia'

import { authenticateFromLink } from './routes/authenticate-from-link'
import { getManagedRestaurante } from './routes/get-managed-restaurante'
import { getProfile } from './routes/get-profile'
import { registerRestaurante } from './routes/register-restaurante'
import { sendAuthLink } from './routes/send-auth-link'
import { signOut } from './routes/sign-out'

const app = new Elysia()
  .use(registerRestaurante)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurante)

app.listen(3333, () => {
  console.log('🔥 HTTP server running!')
})
