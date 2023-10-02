import express from 'express';
import proxy from './proxy';

const router = express.Router();
router.use('/proxy', proxy);

export default router;
