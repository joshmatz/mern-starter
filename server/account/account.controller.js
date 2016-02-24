import Account from './account.model';
import passport from 'passport';

export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.boom.unauthorized();
}

export function isNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  return res.boom.unauthorized();
}

export function getAccount(req, res) {
  res.send(req.user);
}

export function updateAccount(req, res) {
  const updateUser = {
    name: req.body.name,
    email: req.body.email,
  };

  Account.findOneAndUpdate(req.user.id, updateUser, { new: true }, (err, updated) => {
    res.send(updated);
  });
}

export function register(req, res) {
  const account = new Account(req.body);

  account.save((err) => {
    if (err) {
      return res.boom.wrap(err);
    }

    passport.authenticate('local', { failureRedirect: '/login' });

    req.login(account, (loginErr) => {
      if (loginErr) {
        return res.boom.wrap(loginErr);
      }

      Account.findById(req.user._id, (findErr, user) => {
        if (findErr) {
          return res.boom.wrap(findErr);
        }

        res.send(user);
      });
    });
  });
}

export function login(req, res, next) {
  passport.authenticate('local', (err, user) => {
    if (err) { return next(err); }
    if (!user) { return res.boom.unauthorized(); }

    req.login(user, (loginErr) => {
      if (loginErr) { return next(loginErr); }

      Account.findById(req.user._id, (findErr, account) => {
        if (findErr) {
          return res.boom.wrap(findErr);
        }

        res.send(account);
      });
    });
  })(req, res, next);
}

export function logout(req, res) {
  req.logout();
  res.status(200).send('');
}
