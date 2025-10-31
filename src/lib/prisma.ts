import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  })

  prisma.$on('query', (e) => {
    console.log(`\x1b[33m[PRISMA QUERY]\x1b[0m ${e.query}`)
    console.log(`\x1b[36mParams:\x1b[0m ${e.params}`)
    console.log(`\x1b[35mDuration:\x1b[0m ${e.duration}ms\n`)
  })

  return prisma
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
