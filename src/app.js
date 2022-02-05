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
    `Hello World! The time is now ${new Date().toISOString()}`
  );
});

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
