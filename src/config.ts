import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  seedUser: {
    email: process.env.SEED_USER_EMAIL ?? 'admin@bookmarkly.dev',
    password: process.env.SEED_USER_PASSWORD ?? 'password123',
    name: process.env.SEED_USER_NAME ?? 'Anton',
  },
}

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.')
}
