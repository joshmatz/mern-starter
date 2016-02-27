import Account from '../account/account.model';

export function getAccounts(req, res) {
  const limit = req.limit || 10;
  const page = req.page || 1;
  const sort = req.sort || '+email';
  const lean = true;
  const leanWithId = true;

  Account.paginate({}, { limit, page, sort, lean, leanWithId }, (err, result) => {
    res.send(result);
  });
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

export function deleteAccount(req, res) {
  const updateUser = {
    name: req.body.name,
    email: req.body.email,
  };

  Account.findOneAndUpdate(req.user.id, updateUser, { new: true }, (err, updated) => {
    res.send(updated);
  });
}
