import { Router } from 'express'

import { query } from '../db/pool'
import { asyncHandler } from '../middleware/async-handler'

export const categoriesRouter = Router()

interface CategoryRow {
  id: number
  name: string
  alias: string
}

interface BookmarkRow {
  id: number
  category_id: number
  url: string
  title: string | null
  image: string | null
  created_at: Date
}

// GET /api/categories — all categories (bookmarks loaded separately by the client).
categoriesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { rows } = await query<CategoryRow>(
      'SELECT id, name, alias FROM categories ORDER BY id',
    )
    res.json(rows.map((category) => ({ ...category, bookmarks: null })))
  }),
)

// GET /api/categories/:id/bookmarks — bookmarks of one category, newest first.
categoriesRouter.get(
  '/:id/bookmarks',
  asyncHandler(async (req, res) => {
    const { rows } = await query<BookmarkRow>(
      'SELECT id, category_id, url, title, image, created_at FROM bookmarks WHERE category_id = $1 ORDER BY created_at DESC, id DESC',
      [req.params.id],
    )
    res.json(rows)
  }),
)

// POST /api/categories — create a category.
categoriesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, alias } = req.body ?? {}

    if (typeof name !== 'string' || typeof alias !== 'string') {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }

    const { rows } = await query<CategoryRow>(
      'INSERT INTO categories (name, alias) VALUES ($1, $2) RETURNING id, name, alias',
      [name, alias],
    )
    res.status(201).json(rows[0])
  }),
)

// PUT /api/categories/:id — update a category.
categoriesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { name, alias } = req.body ?? {}

    if (typeof name !== 'string' || typeof alias !== 'string') {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }

    const { rows } = await query<CategoryRow>(
      'UPDATE categories SET name = $1, alias = $2 WHERE id = $3 RETURNING id, name, alias',
      [name, alias, req.params.id],
    )

    if (!rows[0]) {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    res.json(rows[0])
  }),
)

// DELETE /api/categories/:id — delete a category (its bookmarks cascade).
categoriesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('DELETE FROM categories WHERE id = $1', [req.params.id])

    if (!rowCount) {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    res.status(204).end()
  }),
)
