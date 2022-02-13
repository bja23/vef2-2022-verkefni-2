import express from 'express';


export const router = express.Router();

export function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}

router.get('/', ensureLoggedIn, async (req, res) => {

  res.render('admin', { title: 'admin svæði' });
});
