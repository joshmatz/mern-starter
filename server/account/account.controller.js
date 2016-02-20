import Account from './account.model';
import passport from 'passport';

export function getAccount(req, res) {
  res.send({ user: req.user });
}

export function updateAccount(req, res) {
  const updateUser = {
    name: req.body.name,
    email: req.body.email,
  };

  Account.findOneAndUpdate(req.user.id, updateUser, { new: true }, (updated) => {
    res.send({ user: updated });
  });
}

export function register(req, res) {
  Account.register(
    new Account({ username: req.body.username }),
    req.body.password,
    (err) => {
      if (err) {
        return res.boom.wrap(err);
      }

      passport.authenticate('local')(req, res, () => {
        res.send(req.user);
      });
    }
  );
}

export function login(req, res, next) {
  req.login(req.body, (err) => {
    if (err) { return next(err); }
    return res.redirect(`/users/${req.user.username}`);
  });
}

export function logout(req, res) {
  req.logout();
  res.status(200).send('');
}
