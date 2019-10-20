import { Router } from 'express';
import UserController from './app/controllers/userController';
import SessionController from './app/controllers/sessionController';
import authController from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);

routes.post('/session', SessionController.store);

routes.use(authController);

routes.put('/users', UserController.update);

export default routes;
