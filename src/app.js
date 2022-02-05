import dotenv from 'dotenv';
import express from 'express';
import { readdir } from 'fs/promises';

dotenv.config();

const app = express();

const {
  PORT: port = 3000,
} = process.env;



app.get('/', async (req, res) => {

  console.info('request to /');
  res.send(
    `birtir forsíðu með skráðum viðburðum, ef engir birta skilaboð um það ${new Date().toISOString()}`
  );
});

app.get('/:slug', async (req, res) => {

  console.info('request to /:slug');
  res.send(
    `birtir viðburð með þeim slug, skráða aðila og skráningarform, ef engin 404 villusíðu ${new Date().toISOString()}`
  );
});

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
