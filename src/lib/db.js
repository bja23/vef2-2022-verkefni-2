import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error(err);
  process.exit(-1);
});

export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('unable to query', e);
    return null;
  } finally {
    client.release();
  }
}

export async function end() {
  await pool.end();
}

export async function createEvent(name, description ) {
  const q = `
    INSERT INTO
      events(name, slug, description, created, updated)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *`;
  const values = [name, name, description, new Date(), new Date()];
  console.log(values);

  const result = await query(q, values);

  return result !== null;
}


export async function updateEventName(name,description,id) {
  const q = `UPDATE
              events
            SET name = $1, description = $2, updated = $3 WHERE id = $4`;
  const values = [name, description, new Date(), id];

  const result = await query(q, values);

  if (result) {
    return result.rows;
  }

  return [];
}
