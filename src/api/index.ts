import express from 'express';
import proxy from './proxy';
import objectserve from './objectserve';

const router = express.Router();
router.use('/proxy', proxy);
router.use('/obj', objectserve);

export default router;
