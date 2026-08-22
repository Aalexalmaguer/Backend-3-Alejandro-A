import { Router } from 'express';
import { usersController } from '../controllers/users.controller.js';

// El router SOLO conecta cada path con el método del Controller.
const router = Router();

router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUserById);
router.post('/', usersController.createUser);
router.delete('/:id', usersController.deleteUser);

export default router;
