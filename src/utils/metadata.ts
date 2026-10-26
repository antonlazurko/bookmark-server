import * as cheerio from 'cheerio'

export interface UrlMetadata {
  title: string | null
  image: string | null
}

// Fetches a page and extracts its title and preview image (OpenGraph first,
// then plain <title>). Any failure resolves to nulls so creating a bookmark
// never fails just because the target site is slow or blocks us.
export const fetchUrlMetadata = async (url: string): Promise<UrlMetadata> => {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BookmarklyBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return { title: null, image: null }

    const html = await response.text()
    const $ = cheerio.load(html)

    const title =
      $('meta[property="og:title"]').attr('content')?.trim() ||
      $('title').first().text().trim() ||
      null
    const image = $('meta[property="og:image"]').attr('content')?.trim() || null

    return { title: title || null, image: image || null }
  } catch {
    return { title: null, image: null }
  }
}
