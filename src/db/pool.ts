import pg from 'pg'

import { config } from '../config'

// A single shared pool for the whole app. Neon requires TLS and serves a
// certificate signed by a public CA, so we keep full certificate verification on.
export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: true,
})

export const query = <T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
) => pool.query<T>(text, params)
