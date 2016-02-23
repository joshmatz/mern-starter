import Express from 'express';
import * as AccountController from './account.controller';
import passport from 'passport';

const router = Express.Router(); // eslint-disable-line

router.route('/account').get(AccountController.getAccount);
router.route('/account').post(AccountController.updateAccount);

router.route('/account/register').post(AccountController.register);
router.post('/account/login', AccountController.login);
router.post('/account/logout', AccountController.logout);

export default router;
