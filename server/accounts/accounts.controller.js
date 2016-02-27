import Account from '../account/account.model';

export function getAccounts(req, res) {
  const limit = req.limit || 10;
  const page = req.page || 1;
  const sort = req.sort || '+email';
  const lean = true;
  const leanWithId = true;

  Account.paginate({}, { limit, page, sort, lean, leanWithId }, (err, result) => {
    if (err) {
      return res.boom.wrap(err);
    }

    res.send(result);
  });
}

export function getAccount(req, res) {
  Account.findById(req.params.id, (err, user) => {
    if (err) {
      return res.boom.wrap(err);
    }

    res.send(user);
  });
}

export function updateAccount(req, res) {
  Account.findById(req.params.id, (err, user) => {
    if (err) {
      return res.boom.wrap(err);
    }

    const updateUser = {
      $set: {
        name: req.body.hasOwnProperty('name') ? req.body.name : user.name,
        email: req.body.hasOwnProperty('email') ? req.body.email : user.email,
      },
    };

    Account.findOneAndUpdate(req.params.id, updateUser, { new: true }, (updateErr, updated) => {
      if (updateErr) {
        return res.boom.wrap(updateErr);
      }

      res.send(updated);
    });
  });
}

export function deleteAccount(req, res) {
  Account.remove({ _id: req.params.id }, (err) => {
    if (err) {
      return res.boom.wrap(err);
    }

    res.send('');
  });
}
