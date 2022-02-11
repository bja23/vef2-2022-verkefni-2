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
import { createEvent, updateEventName } from './lib/db.js';
import { ensureLoggedIn } from './routes/admin-routes.js';
import xss from 'xss';

dotenv.config();


const app = express();

app.use(express.urlencoded({ extended: true }));



const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));
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

const validation = [
  body('name')
  .isLength({ min: 1, max: 64 })
  .withMessage('Nafn má ekki vera tómt'),
  body('comment')
  .isLength({ max: 254 })
  .withMessage('Athugasemnd má ekki vera lengri en 254 stafir'),
];

const sanitazion = [
  body('name').trim().escape(),
  body('name').customSanitizer((value) => xss(value)),
  body('comment').customSanitizer((value) => xss(value)),
];

const validationResults = async (req, res, next) => {
  const { name = '' } = req.body;

  const result = validationResult(req);

  const list = await selectSQL(nodeEnv,connectionString,1,req.body.id);
  const list3 = await selectSQLr(nodeEnv,connectionString,req.body.id,req.body.name);
  if (!result.isEmpty()) {
    // const errorMessages = errors.array().map((i) => i.msg);
    return res.render('event', {
      title: 'Skrá í event',
      errors: result.errors,
      name: name,
      list: list,
      list3: list3
    });
  }

  return next();
};

const validationResultsAdminEvent = async (req, res, next) => {
  const { name = '' } = req.body;

  const result = validationResult(req);

  const list = await selectSQL(nodeEnv,connectionString,0,'test');


  if (!result.isEmpty()) {
    return res.render('admin',{
      title: 'admin',
      errors: result.errors,
      name: name,
      list: list,
  });
}
  return next();
};

const validationResultsAdminEventUpdate = async (req, res, next) => {
  const { name = '' } = req.body;

  const result = validationResult(req);
  console.log(req.body.id, req.body.name);

  const list = await selectSQL(nodeEnv,connectionString,1,req.body.id);
  const list3 = await selectSQLr(nodeEnv,connectionString,req.body.id,req.body.name);


  if (!result.isEmpty()) {
    console.log("testste");
    return res.render('adminUpdateEvent',{
      title: 'admin',
      errors: result.errors,
      name: name,
      list: list,
      list3: list3
  });
}
  return next();
};
/**
 * Hjálparfall til að athuga hvort reitur sé gildur eða ekki.
 *
 * @param {string} field Heiti á reit í formi
 * @param {array} errors Fylki af villum frá express-validator pakkanum
 * @returns {boolean} `true` ef `field` er í `errors`, `false` annars
 */
 function isInvalid(field, errors = []) {
  // Boolean skilar `true` ef gildi er truthy (eitthvað fannst)
  // eða `false` ef gildi er falsy (ekkert fannst: null)
  return Boolean(errors.find((i) => i && i.param === field));
}

app.locals.isInvalid = isInvalid;

app.get('/', async (req, res) => {

  console.info('request to /');

  const list = await selectSQL(nodeEnv,connectionString,0,'test');

  if(!list[0].id == 1){
    return res.send('404');
  };

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
    errors: [],
    name: '',
    list: list,
    list3: list3
  });
});



export const postEvent =  async (req, res) => {
  // fa inn fra form
  const data = req.body;

  // insert into db
  const list2 = await insertSQL(nodeEnv,connectionString,data.id,data.name, data.comment);


  const list = await selectSQL(nodeEnv,connectionString,1,data.id);
  const list3 = await selectSQLr(nodeEnv,connectionString,data.id,data.name);
  const name = data.name;

  res.render('event',{
    title: 'Skrá í event',
    errors: [],
    name: name,
    list: list,
    list3: list3
  });
};

app.post('/events', validation, validationResults, sanitazion, postEvent);


app.get('/admin/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }

  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er
  //  birtum þau og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.send(`
    <form method="post" action="/login">
      <label>Notendanafn: <input type="text" name="username"></label>
      <label>Lykilorð: <input type="password" name="password"></label>
      <button>Innskrá</button>
    </form>
    <p>${message}</p>
  `);
});

app.post('/login',
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),
  async (req, res) => {
    res.redirect('/admin');
  }
);


app.get('/admin', ensureLoggedIn,
  async (req, res) => {

    const list = await selectSQL(nodeEnv,connectionString,0,'test');

    if(!list[0].id == 1){
      return res.send('404');
    };

    res.render('admin',{
      title: 'admin',
      errors: [],
      name: '',
      list: list,
    });
  }
);

app.post('/admin', ensureLoggedIn, validation, validationResultsAdminEvent, sanitazion,

  async (req, res) => {
    const name = req.body.name;
    const description = req.body.comment;
    console.log("info: ", name, description);

    const inst = await createEvent(name, description);

    const list = await selectSQL(nodeEnv,connectionString,0,'test');

    res.render('admin',{
      title: 'admin',
      errors: [],
      name: '',
      list: list,
    });
  });

  app.get('/admin/events', ensureLoggedIn,
    async (req, res) => {
    const list = await selectSQL(nodeEnv,connectionString,1,req.query.id);
    const list3 = await selectSQLr(nodeEnv,connectionString,req.query.id,req.query.slug);

    res.render('adminUpdateEvent',{
      title: 'þarfadbreyta',
      errors: [],
      name: '',
      list: list,
      list3: list3
    });
  });

  app.post('/admin/event',
   ensureLoggedIn, validation, validationResultsAdminEventUpdate,
    sanitazion, async (req, res) => {
    // fa inn fra form
    const data = req.body;
    // insert into db
    const list2 = await updateEventName(data.name,data.description,data.id);
    console.log("changed to: ", data.name, data.description, data.id);

    const list = await selectSQL(nodeEnv,connectionString,1,data.id);
    const list3 = await selectSQLr(nodeEnv,connectionString,data.id,data.name);

    res.render('adminUpdateEvent',{
      title: 'þarfadbreyta',
      errors: [],
      name: '',
      list: list,
      list3: list3
    });
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });





app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
