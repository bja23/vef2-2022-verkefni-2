import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import { readdir } from 'fs/promises';

export async function selectSQLr(nodeEnv, connectionString,number,num){
  const ssl = nodeEnv !== 'development' ? {rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl});

pool.on('error', (err) => {
  console.error('postgres error, exiting...', err);
  process.exit(-1);
});

let client;
let list;

try {
  client = await pool.connect();
} catch (e) {
  console.error('Unable to connect', e);
  return;
}

try {

    const query = {
      // give the query a unique name
      text: 'SELECT name, comment FROM registration WHERE event = $1',
      values: [number],
    }

    const result = await client.query(query);
  list = result.rows;
} catch (e) {
  console.error('Error selecting', e);
} finally {
  client.release();
}

await pool.end();
return list;
}

export async function selectSQL(nodeEnv, connectionString,number,sqlname){

const ssl = nodeEnv !== 'development' ? {rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl});

pool.on('error', (err) => {
  console.error('postgres error, exiting...', err);
  process.exit(-1);
});

let client;
let list;

try {
  client = await pool.connect();
} catch (e) {
  console.error('Unable to connect', e);
  return;
}

try {

  let result = await client.query('SELECT name,slug,id, description FROM events');

  if (number === 1){
    const query = {
      // give the query a unique name
      text: 'SELECT * FROM events WHERE id = $1',
      values: [sqlname],
    }

    result = await client.query(query);
  }
  list = result.rows;
} catch (e) {
  console.error('Error selecting', e);
} finally {
  client.release();
}

await pool.end();
return list;
}
