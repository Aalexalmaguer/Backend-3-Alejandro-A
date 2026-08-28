import { Router } from 'express';
import { usersController } from '../controllers/users.controller.js';
import { filesController } from '../controllers/files.controller.js';
import { ensureUserExists } from '../middlewares/entityExists.js';
import { uploadSingle, subdirForDocumentType } from '../config/multer.js';

// El router SOLO conecta cada path con el método del Controller.
const router = Router();

router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUserById);
router.post('/', usersController.createUser);
router.delete('/:id', usersController.deleteUser);

// Carga de documentos (M7): valida usuario → sube archivo → registra metadatos.
// La subcarpeta se resuelve según el documentType enviado.
router.post(
  '/:id/documents',
  ensureUserExists,
  uploadSingle((req) => subdirForDocumentType(req.body.documentType)),
  filesController.uploadUserDocument
);

export default router;
