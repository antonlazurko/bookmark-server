import bcrypt from 'bcryptjs'
import { Router } from 'express'
import jwt from 'jsonwebtoken'

import { config } from '../config'
import { query } from '../db/pool'
import { asyncHandler } from '../middleware/async-handler'

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
