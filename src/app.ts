import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'

import { openApiSpec } from './docs/openapi'
import { errorHandler, notFound } from './middleware/error'
import { authRouter } from './routes/auth.routes'
import { bookmarksRouter } from './routes/bookmarks.routes'
import { categoriesRouter } from './routes/categories.routes'
import { profileRouter } from './routes/profile.routes'

export const app = express()

app.use(cors())
app.use(express.json())

// Health check (used by Render to verify the service is up).
app.get('/', (_req, res) => {
  res.json({ status: 'ok' })
})

// API docs: Swagger UI and the raw OpenAPI spec.
app.get('/api/docs.json', (_req, res) => {
  res.json(openApiSpec)
})
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))

app.use('/api/auth', authRouter)
app.use('/api/profile', profileRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/bookmarks', bookmarksRouter)

app.use(notFound)
app.use(errorHandler)
