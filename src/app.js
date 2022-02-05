import dotenv from 'dotenv';
import express from 'express';
import { readdir } from 'fs/promises';

dotenv.config();

const app = express();

const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;



app.get('/', async (req, res) => {

  console.info('request to /');
  res.send(
    `Hello World! The time is now ${new Date().toISOString()}`
  );
});

app.listen(port, () => {
  console.info(`Server running at http://${host}:${port}/`);
});
