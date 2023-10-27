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
  const method = req.params.method;
  const randomId = Math.floor(Math.random() * 100000000);
  console.log('urn_request', req.ip, randomId, method, req.params, req.query, req.originalUrl);
  if (!connectedClient) {
    await connectClient();
  }
  try {
    const urnResponseFactory = new UrnResponseFactory(connectClient);
    urnResponseFactory.handleRequest(req, res, randomId);
  } catch (err: any) {
    console.log('request_error', req.ip, randomId, method, err);
    let statusCode = 500;
    if (err.code === 800422) {
      statusCode = 422;
    }
    res.status(statusCode).json({ success: false, code: err.code ? err.code : undefined, message: err.message ? err.message : err.toString() } as any);
  }
};

router.get<{}, ObjectServeResponse>('/:urn*', async (req, res) => {
  console.log('urnnnnnn');
  handleUrnRequest(req, res);
});

 

router.get<{}, ObjectServeResponse>('/', async (req, res) => {
  res.status(200).json(ServerMessage);
});

export default router;
