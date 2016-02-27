import Express from 'express';
import * as AccountController from './account.controller';

const router = Express.Router(); // eslint-disable-line

router.get('/account', AccountController.isAuthenticated, AccountController.getAccount);
router.post('/account', AccountController.isAuthenticated, AccountController.updateAccount);
router.post('/account/logout', AccountController.isAuthenticated, AccountController.logout);

router.post('/account/register', AccountController.isNotAuthenticated, AccountController.register);
router.post('/account/login', AccountController.isNotAuthenticated, AccountController.login);

router.post('/account/token', AccountController.generateToken);
router.post('/account/reset', AccountController.reset);

export default router;
