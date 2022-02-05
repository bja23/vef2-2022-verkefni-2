import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import { readdir } from 'fs/promises';

export async function insertSQL(nodeEnv, connectionString,number,sqlname){

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

  const q = `INSERT INTO registration (name,comment,created )
  VALUES('blabla', 'test3-event','2017-05-1');`
  let result = await client.query(q);


} catch (e) {
  console.error('Error selecting', e);
} finally {
  client.release();
}

await pool.end();
return true;
}
