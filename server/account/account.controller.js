import Account from './account.model';
import passport from 'passport';
import bcrypt from 'bcrypt';
import uuid from 'node-uuid';

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

export function isAdmin(req, res, next) {
  if (req.user.role === 'admin') {
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

  account.role = 'user';

  account.save((err) => {
    if (err) {
      return res.boom.wrap(err);
    }

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

export function generateToken(req, res) {
  if (!req.body.email) {
    return res.boom.badRequest('Email required');
  }
  const now = new Date();
  const minutesToExpire = 120;
  const expiresAt = now.setMinutes(now.getMinutes() + minutesToExpire);
  const token = uuid.v4();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return res.boom.wrap(err);
    }

    bcrypt.hash(token, salt, (hashErr, hash) => {
      if (hashErr) {
        return res.boom.wrap(hashErr);
      }

      const resetObject = {
        $set: {
          resetPasswordToken: hash,
          resetPasswordExpires: expiresAt,
        },
      };

      Account.findOneAndUpdate({ email: req.body.email }, resetObject, (updateErr) => {
        if (updateErr) {
          return res.boom.wrap(updateErr);
        }

        // send email

        return res.send('');
      });
    });
  });
}

export function reset(req, res) {
  const find = {
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: new Date() },
  };

  const newPassword = {
    password: req.body.password,
  };

  Account.findOneAndUpdate(find, newPassword, (updateErr, isFound) => {
    if (updateErr) {
      return res.boom.wrap(updateErr);
    }

    if (!isFound) {
      return res.boom.notFound();
    }

    // send email

    return res.send('');
  });
}

