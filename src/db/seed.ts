import bcrypt from 'bcryptjs'

import { config } from '../config'
import { pool, query } from './pool'

interface SeedCategory {
  name: string
  alias: string
  bookmarks: { url: string; title: string }[]
}

const categories: SeedCategory[] = [
  {
    name: 'Development',
    alias: 'development',
    bookmarks: [
      { url: 'https://vuejs.org', title: 'Vue.js' },
      { url: 'https://developer.mozilla.org', title: 'MDN Web Docs' },
      { url: 'https://github.com', title: 'GitHub' },
    ],
  },
  {
    name: 'Design',
    alias: 'design',
    bookmarks: [
      { url: 'https://www.figma.com', title: 'Figma' },
      { url: 'https://dribbble.com', title: 'Dribbble' },
      { url: 'https://fonts.google.com', title: 'Google Fonts' },
    ],
  },
  {
    name: 'Learning',
    alias: 'learning',
    bookmarks: [
      { url: 'https://www.freecodecamp.org', title: 'freeCodeCamp' },
      { url: 'https://javascript.info', title: 'The Modern JavaScript Tutorial' },
      { url: 'https://www.coursera.org', title: 'Coursera' },
    ],
  },
  {
    name: 'Tools',
    alias: 'tools',
    bookmarks: [
      { url: 'https://vite.dev', title: 'Vite' },
      { url: 'https://code.visualstudio.com', title: 'Visual Studio Code' },
      { url: 'https://www.notion.so', title: 'Notion' },
    ],
  },
  {
    name: 'News',
    alias: 'news',
    bookmarks: [
      { url: 'https://news.ycombinator.com', title: 'Hacker News' },
      { url: 'https://www.theverge.com', title: 'The Verge' },
      { url: 'https://techcrunch.com', title: 'TechCrunch' },
    ],
  },
  {
    name: 'Marketing',
    alias: 'marketing',
    bookmarks: [
      { url: 'https://www.semrush.com', title: 'Semrush' },
      { url: 'https://mailchimp.com', title: 'Mailchimp' },
      { url: 'https://ahrefs.com', title: 'Ahrefs' },
    ],
  },
  {
    name: 'Entertainment',
    alias: 'entertainment',
    bookmarks: [
      { url: 'https://www.youtube.com', title: 'YouTube' },
      { url: 'https://open.spotify.com', title: 'Spotify' },
      { url: 'https://www.twitch.tv', title: 'Twitch' },
    ],
  },
]

const seed = async () => {
  // Start from a clean slate so the seed is repeatable.
  await query('TRUNCATE users, categories, bookmarks RESTART IDENTITY CASCADE')

  const passwordHash = await bcrypt.hash(config.seedUser.password, 10)
  await query('INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)', [
    config.seedUser.email,
    passwordHash,
    config.seedUser.name,
  ])

  for (const category of categories) {
    const { rows } = await query<{ id: number }>(
      'INSERT INTO categories (name, alias) VALUES ($1, $2) RETURNING id',
      [category.name, category.alias],
    )
    const categoryId = rows[0]!.id

    for (const bookmark of category.bookmarks) {
      await query('INSERT INTO bookmarks (category_id, url, title) VALUES ($1, $2, $3)', [
        categoryId,
        bookmark.url,
        bookmark.title,
      ])
    }
  }

  console.log(
    `Seeded 1 user (${config.seedUser.email}), ${categories.length} categories and ` +
      `${categories.reduce((total, category) => total + category.bookmarks.length, 0)} bookmarks.`,
  )
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
