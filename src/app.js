import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import { readdir } from 'fs/promises';

import { selectSQL,selectSQLr } from "./select.js";
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
  const list = await selectSQL(nodeEnv,connectionString,1,req.query.id);
  const list3 = await selectSQLr(nodeEnv,connectionString,req.query.id,req.query.slug);

  res.render('event',{
    title: 'þarfadbreyta',
    list: list,
    list3: list3
  });
});

app.use(express.urlencoded({ extended: true }));

app.post('/events', async (req, res) => {
  // fa inn fra form
  const data = req.body;

  // insert into db
  const list2 = await insertSQL(nodeEnv,connectionString,data.id,data.name);


  // kalla a db

  // render með nyju info

  const list = await selectSQL(nodeEnv,connectionString,1,data.id);
  const list3 = await selectSQLr(nodeEnv,connectionString,data.id,data.name);

  res.render('event',{
    title: 'þarfadbreyta',
    list: list,
    list3: list3
  });
});

app.get('/admin/login', async (req, res) => {
  res.render('login',{
    title: "Login"
  });
});

app.post('/admin', async (req, res) => {

  res.render('login',{
    title: "Admin"
  });
});




app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
