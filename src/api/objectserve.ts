import express from 'express';
import { ServerMessage, connectClient, connectedClient } from '../app';
const router = express.Router();
type ObjectServeResponse = any;

/**
 * Handles the URN request
 * @param req Request object
 * @param res Response object
 * @returns 
 */
const handleUrnRequest = async (req, res) => {
  const method = req.params['method'];
  const randomId = Math.floor(Math.random() * 100000000)
  console.log('urn_request', req.ip, randomId, method, req.params, req.query)
  if (!connectedClient) {
    await connectClient();
  }

  let params = req.params;
  let urn = params.urn;

  res.status(200).json({ success: true, urn } as any);
}

router.get<{}, ObjectServeResponse>('/:urn', async (req, res) => {
  handleUrnRequest(req, res);
});

router.get<{}, ObjectServeResponse>('/', async (req, res) => {
  res.status(200).json(ServerMessage);
});

export default router;
