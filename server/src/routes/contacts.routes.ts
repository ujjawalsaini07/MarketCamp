import { Router } from 'express';
import { getContacts, createContact, importContacts, deleteContact, unsubscribeContact, updateContact } from '../controllers/contacts.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getContacts);
router.post('/', requireAuth, createContact);
router.post('/import', requireAuth, importContacts);
router.patch('/:id', requireAuth, updateContact);
router.delete('/:id', requireAuth, deleteContact);
router.patch('/:id/unsubscribe', unsubscribeContact);

export default router;
