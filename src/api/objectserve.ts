import express from 'express';
import { ServerMessage, connectClient, connectedClient } from '../app';
import { UrnResponseFactory } from '../helpers/urn-response-factory';
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
  const urnResponseFactory = new UrnResponseFactory(connectClient);
  urnResponseFactory.handleRequest(req, res);
}

router.get<{}, ObjectServeResponse>('/:urn', async (req, res) => {
  handleUrnRequest(req, res);
});

router.get<{}, ObjectServeResponse>('/', async (req, res) => {
  res.status(200).json(ServerMessage);
});

export default router;
