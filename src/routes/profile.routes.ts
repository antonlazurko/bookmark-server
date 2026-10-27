import { Router } from 'express'

import { query } from '../db/pool'
import { asyncHandler } from '../middleware/async-handler'
import { requireAuth } from '../middleware/auth'

export const profileRouter = Router()

// GET /api/profile — returns the display name of the user from the Bearer token.
profileRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { rows } = await query<{ name: string }>('SELECT name FROM users WHERE id = $1', [
      res.locals.userId,
    ])
    if (!rows[0]) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    res.json({ name: rows[0].name })
  }),
)
