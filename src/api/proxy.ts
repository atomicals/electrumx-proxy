import express from 'express';

const router = express.Router();

type EmojiResponse = string[];

router.get<{}, EmojiResponse>('/:method', (req, res) => {

  console.log('req', req.params)
  res.json(['😀', 's', '🙄']);
});

export default router;
