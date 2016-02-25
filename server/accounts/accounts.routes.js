import Express from 'express';
import * as AccountController from '../account/account.controller';
import * as AccountsController from './accounts.controller';

const router = Express.Router(); // eslint-disable-line

router.get('/accounts', AccountController.isAuthenticated, AccountController.isAdmin, AccountsController.getAccounts);
router.get('/accounts/:id', AccountController.isAuthenticated, AccountController.isAdmin, AccountsController.getAccount);
router.post('/accounts/:id', AccountController.isAuthenticated, AccountController.isAdmin, AccountsController.updateAccount);
router.delete('/accounts/:id', AccountController.isAuthenticated, AccountController.isAdmin, AccountsController.deleteAccount);

export default router;
