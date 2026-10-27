import bcrypt from 'bcryptjs'
import { Router } from 'express'
import jwt from 'jsonwebtoken'

import { config } from '../config'
import { query } from '../db/pool'
import { asyncHandler } from '../middleware/async-handler'
import { requireAuth } from '../middleware/auth'

export const authRouter = Router()

interface UserRow {
  id: number
  email: string
  password_hash: string
}

// POST /api/auth/login — validates credentials and returns a signed JWT.
authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {}

    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }

    const { rows } = await query<UserRow>(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email],
    )
    const user = rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const token = jwt.sign({ sub: String(user.id), email: user.email }, config.jwtSecret, {
      expiresIn: '7d',
    })
    res.json({ token })
  }),
)

// GET /api/auth/profile — returns email and name of the user from the Bearer token.
authRouter.get(
  '/profile',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { rows } = await query<{ email: string; name: string }>(
      'SELECT email, name FROM users WHERE id = $1',
      [res.locals.userId],
    )
    if (!rows[0]) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    res.json(rows[0])
  }),
)
