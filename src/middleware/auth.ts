import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

import { config } from '../config'

// Verifies the Bearer token and stores the user id in res.locals.userId.
export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer /, '')
  try {
    const userId = token ? (jwt.verify(token, config.jwtSecret) as jwt.JwtPayload).sub : undefined
    if (userId) {
      res.locals.userId = userId
      next()
      return
    }
  } catch {}
  res.status(401).json({ error: 'Unauthorized' })
}
