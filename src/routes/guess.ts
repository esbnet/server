import { FastifyInstance } from "fastify"
import { number, z } from "zod"

import { prisma } from "../lib/prisma"
import { authenticate } from "../plugin/authenticate"

export async function guessRoutes(fastify: FastifyInstance) {
  fastify.get("/guesses/count", async () => {
    const count = await prisma.guess.count()
    return { count }
  })

  fastify.post(
    "/polls/:pollId/games/:gameId/guesses",
    { onRequest: [authenticate] },
    async (request, replay) => {
      const createGuessParams = z.object({
        pollId: z.string(),
        gameId: z.string(),
      })

      const createGuessBody = z.object({
        firstTeamPoint: z.number(),
        secondTeamPoint: z.number(),
      })

      const { pollId, gameId } = createGuessParams.parse(request.params)
      const { firstTeamPoint, secondTeamPoint } = createGuessBody.parse(
        request.body
      )

      const participant = await prisma.participant.findUnique({
        where: {
          userId_pollId: {
            pollId,
            userId: request.user.sub,
          },
        },
      })

      if (!participant) {
        return replay.status(400).send({
          message: "Você não participa deste bolão",
        })
      }

      const guess = await prisma.guess.findUnique({
        where: {
          participantId_gameId: {
            participantId: participant.id,
            gameId,
          },
        },
      })

      if (guess) {
        return replay.status(400).send({
          message: "Você já registrou seu palpite para este bolão",
        })
      }

      const game = await prisma.game.findUnique({
        where: {
          id: gameId,
        },
      })

      if (!game) {
        return replay.status(400).send({
          message: "Palpite não localizado!",
        })
      }

      // if (game.date < new Date()) {
      //   return replay.status(400).send({
      //     message: "Este bolão já está finalizado!",
      //   })
      // }

      await prisma.guess.create({
        data: {
          gameId,
          participantId: participant.id,
          firstTeamPoint,
          secondTeamPoint,
        },
      })

      return replay.status(201).send()
    }
  )
}
