import cors from "@fastify/cors"
import Fastify from "fastify"

import { authRoutes } from "./routes/auth"
import { gameRoutes } from "./routes/game"
import { guessRoutes } from "./routes/guess"
import { poolRoutes } from "./routes/poll"
import { userRoutes } from "./routes/user"

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  })

  await fastify.register(cors, {
    origin: true,
  })

  await fastify.register(authRoutes)
  await fastify.register(gameRoutes)
  await fastify.register(poolRoutes)
  await fastify.register(userRoutes)
  await fastify.register(guessRoutes)
  
  await fastify.listen(
    {
      port: 3333,
      host: "0.0.0.0",
    },
    () => {
      console.log(" 🚀 Server up and listening on port 3333")
    }
  )
}

bootstrap()
