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

export async function createEvent(name, description) {
  const slug2 = [];

  for (let i = 0; i < name.length; i++) {
    const ch = name[i].toLowerCase();
    const char = ch
      .replace(' ', '-')
      .replace('ð', 'd')
      .replace('þ', 'th')
      .replace('ö', 'o')
      .replace('á', 'a')
      .replace('é', 'e')
      .replace('í', 'i')
      .replace('ó', 'o')
      .replace('ú', 'u')
      .replace('ý', 'y')
      .replace('æ', 'ae');
    slug2.push(char);
  }

  const slug = slug2.join('');
  const q = `
    INSERT INTO
      events(name, slug, description, created, updated)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *`;
  const values = [name, slug, description, new Date(), new Date()];

  const result = await query(q, values);

  return result !== null;
}

export async function updateEventName(name, description, id) {
  const slug2 = [];

  for (let i = 0; i < name.length; i++) {
    const ch = name[i].toLowerCase();
    const char = ch
      .replace(' ', '-')
      .replace('ð', 'd')
      .replace('þ', 'th')
      .replace('ö', 'o')
      .replace('á', 'a')
      .replace('é', 'e')
      .replace('í', 'i')
      .replace('ó', 'o')
      .replace('ú', 'u')
      .replace('ý', 'y')
      .replace('æ', 'ae');
    slug2.push(char);
  }

  const slug = slug2.join('');
  const q = `UPDATE
              events
            SET name = $1, slug = $2, description = $3, updated = $4 WHERE id = $5`;
  const values = [name, slug, description, new Date(), id];

  const result = await query(q, values);

  if (result) {
    return result.rows;
  }

  return [];
}

export async function insertSQL( number, sqlname,comment) {

  const q = `INSERT INTO registration (name,comment,event,created )
  VALUES($2, $3,$1,$4)`;
  const values = [number, sqlname, comment, new Date()];

  const result = await query(q, values);

  if (result) {
    return result.rows;
  }

  return [];
}

export async function selectSQL( number, sqlname) {

  let result2 = await selectSQL0(sqlname);

  if (number === 1) {
    result2 = await selectSQL1(sqlname);
  };



  return result2;
}

export async function selectSQL0( sqlname) {

  const q = "SELECT name,slug,id, description FROM events";
  const result = await query(q, []);

  let list = result.rows;

  return list;
}

export async function selectSQL1(sqlname) {

  const q = "SELECT * FROM events WHERE id = $1";
  const values =  [sqlname];

  const result = await query(q, values);
  let list = result.rows;

  return list;
}


export async function selectSQLr(number, num) {

  const q = "SELECT name, comment FROM registration WHERE event = $1";
  const values = [number];

  const result = await query(q, values);
  const list = result.rows;

  return list;
}


