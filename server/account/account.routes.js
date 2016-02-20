import Express from 'express';
import * as AccountController from './post.controller';
const router = Express.Router(); // eslint-disable-line

router.route('/account').get(AccountController.getAccount);
router.route('/account').post(AccountController.updateAccount);

router.route('/account/register').post(AccountController.register);
router.route('/account/login').post(AccountController.login);
router.route('/account/logout').post(AccountController.logout);

export default router;
