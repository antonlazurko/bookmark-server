import type { RequestHandler } from 'express'

// Wraps an async route handler so rejected promises reach Express' error handler
// instead of crashing the process (Express 4 does not do this on its own).
export const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next)
