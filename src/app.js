import session from 'express-session';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import { readdir } from 'fs/promises';
import { selectSQL,selectSQLr } from "./select.js";
import { insertSQL } from "./insert.js";
import { comparePasswords, findById, findByUsername } from './lib/users.js';

dotenv.config();


const app = express();

app.use(express.urlencoded({ extended: true }));

const path = dirname(fileURLToPath(import.meta.url));

app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

const {
  PORT: port = 3000,
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
  SESSION_SECRET: sessionSecret = 'alæskdjfæalskdjfælaksjdf',
} = process.env;

if (!sessionSecret || !connectionString) {
  console.error('Vantar .env gildi');
  process.exit(1);
}

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

async function strat(username, password, done) {
  try {
    const user = await findByUsername(username);

    if (!user) {
      return done(null, false);
    }

    // Verður annað hvort notanda hlutur ef lykilorð rétt, eða false
    const result = await comparePasswords(password, user.password);

    return done(null, result ? user : false);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

passport.use(
  new Strategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    strat
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findById(id);
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

app.use(passport.initialize());
app.use(passport.session());

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

app.get('/admin/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er
  //  birtum þau og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.send(`
    <form method="post" action="/admin">
      <label>Notendanafn: <input type="text" name="username"></label>
      <label>Lykilorð: <input type="password" name="password"></label>
      <button>Innskrá</button>
    </form>
    <p>${message}</p>
  `);
});

app.post('/admin',
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),
  (req, res) => {
    res.redirect('/admin');
  }
);




app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
