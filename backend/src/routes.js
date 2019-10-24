import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controllers/userController';
import SessionController from './app/controllers/sessionController';
import FileController from './app/controllers/fileController';
import providerController from './app/controllers/providerController';
import appointmenController from './app/controllers/appointmenController';
import authController from './app/middlewares/auth';

import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);

routes.post('/session', SessionController.store);

routes.use(authController);

routes.put('/users', UserController.update);

routes.get('/providers', providerController.index);

routes.post('/appointmen', appointmenController.store);

routes.post('/file', upload.single('file'), FileController.store);

export default routes;
