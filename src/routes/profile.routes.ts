import { Router } from 'express'

import { query } from '../db/pool'
import { asyncHandler } from '../middleware/async-handler'

export const profileRouter = Router()

// GET /api/profile — returns the single seeded user's display name.
profileRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { rows } = await query<{ name: string }>('SELECT name FROM users ORDER BY id LIMIT 1')
    res.json({ name: rows[0]?.name ?? '' })
  }),
)
