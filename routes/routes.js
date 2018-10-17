import { Router } from 'express';
import * as userController from '../controllers/user.controller';

const router = new Router();

router.post('/login', userController.login);
router.post('/logout',userController.logout);
router.post('/register',userController.register);
router.post('/track',userController.track);
router.post('/update',userController.updateLocation);


export default router; 

