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
      res.send(req.user);
    });
  });

  // Account.register(
  //   new Account(account),
  //   req.body.password,
  //   (err) => {
  //     console.log('register::err: ', err);
  //     if (err) {
  //       return res.boom.wrap(err);
  //     }

  //     console.log('req.body: ', req.body);

  //     // Account.authenticate()

  //     // req.login(req.body, (loginErr) => {
  //     //   if (loginErr) { return res.boom.wrap(loginErr); }
  //     //   console.log('req.user: ', req.user);
  //     //   res.send(req.user);
  //     // });

  //     // passport.authenticate('local')(req, res, (authenticateErr) => {
  //     //   console.log('passport::err: ', authenticateErr);
  //     //   console.log('req.user: ', req.user);
  //     //   res.send(req.user);
  //     //   // Account.findOneAndUpdate({ email: req.user.email }, { name: 'Jonah' }, { new: true }, (findErr, user) => {
  //     //   //   console.log('user: ', user);

  //     //   // });
  //     // });
  //   }
  // );
}

export function login(req, res, next) {
  req.login(req.body, (err) => {
    if (err) { return next(err); }
    res.send(req.user);
  });
}

export function logout(req, res) {
  req.logout();
  res.status(200).send('');
}
