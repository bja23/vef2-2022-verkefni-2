import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import { readdir } from 'fs/promises';

import { selectSQL } from "./select.js";
import { insertSQL } from "./insert.js";

dotenv.config();

const app = express();

const path = dirname(fileURLToPath(import.meta.url));

app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

const {
  PORT: port = 3000,
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

app.get('/', async (req, res) => {

  console.info('request to /');

  const list = await selectSQL(nodeEnv,connectionString,0,'test');

  res.render('index',{
    title: 'heimasida',
    list: list
  });
});

app.get('/events', async (req, res) => {

  const list = await selectSQL(nodeEnv,connectionString,1,req.query.slug);
  console.log(list);

  res.render('event',{
    title: 'þarfadbreyta',
    list: list
  });
});

app.use(express.urlencoded({ extended: true }));
/*
app.use((req, res, next) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    req.body = chunks.join();
    next();
  });
});
*/

app.post('/events', async (req, res) => {
  // fa inn fra form

  // insert into db
  const list2 = await insertSQL(nodeEnv,connectionString,1,req.query.slug);
  console.log('TEST: ', list2);

  // kalla a db

  // render með nyju info
  const data = req.body;

  console.log(req.body);
  console.log(data.slug);

  const list = await selectSQL(nodeEnv,connectionString,1,data.slug);

  res.render('event',{
    title: 'þarfadbreyta',
    list: list
  });
});



app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
