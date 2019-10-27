import { Router } from 'express';
import multer from 'multer';

import UserController from './app/controllers/userController';
import SessionController from './app/controllers/sessionController';
import FileController from './app/controllers/fileController';
import providerController from './app/controllers/providerController';
import appointmenController from './app/controllers/appointmenController';
import scheduleController from './app/controllers/scheduleController';
import availableController from './app/controllers/availableController';
import notificationController from './app/controllers/notificationController';
import authController from './app/middlewares/auth';

import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);

routes.post('/session', SessionController.store);

routes.use(authController);

routes.put('/users', UserController.update);

routes.get('/providers', providerController.index);
routes.get('/providers/:providerId/available', availableController.index);

routes.post('/appointmen', appointmenController.store);
routes.get('/appointmen', appointmenController.index);
routes.delete('/appointmen/:id', appointmenController.delete);

routes.get('/schedule', scheduleController.index);

routes.get('/notification', notificationController.index);
routes.put('/notification/:id', notificationController.update);

routes.post('/file', upload.single('file'), FileController.store);

export default routes;
