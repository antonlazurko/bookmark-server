import { Router } from 'express'

import { query } from '../db/pool'
import { asyncHandler } from '../middleware/async-handler'
import { fetchUrlMetadata } from '../utils/metadata'

export const bookmarksRouter = Router()

interface BookmarkRow {
  id: number
  category_id: number
  url: string
  title: string | null
  image: string | null
  created_at: Date
}

// POST /api/bookmarks — create a bookmark; title and image are scraped from the URL.
bookmarksRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { category_id, url } = req.body ?? {}

    if (!Number.isInteger(category_id) || typeof url !== 'string') {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }

    const category = await query('SELECT id FROM categories WHERE id = $1', [category_id])
    if (!category.rows[0]) {
      res.status(404).json({ error: 'Category not found' })
      return
    }

    const { title, image } = await fetchUrlMetadata(url)

    const { rows } = await query<BookmarkRow>(
      `INSERT INTO bookmarks (category_id, url, title, image)
       VALUES ($1, $2, $3, $4)
       RETURNING id, category_id, url, title, image, created_at`,
      [category_id, url, title, image],
    )
    res.status(201).json(rows[0])
  }),
)

// DELETE /api/bookmarks/:id — delete a bookmark.
bookmarksRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('DELETE FROM bookmarks WHERE id = $1', [req.params.id])

    if (!rowCount) {
      res.status(404).json({ error: 'Bookmark not found' })
      return
    }
    res.status(204).end()
  }),
)
