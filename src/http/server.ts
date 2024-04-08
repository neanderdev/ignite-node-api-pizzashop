import { Elysia } from 'elysia'

import { authenticateFromLink } from './routes/authenticate-from-link'
import { registerRestaurante } from './routes/register-restaurante'
import { sendAuthLink } from './routes/send-auth-link'

const app = new Elysia()
  .use(registerRestaurante)
  .use(sendAuthLink)
  .use(authenticateFromLink)

app.listen(3333, () => {
  console.log('🔥 HTTP server running!')
})
