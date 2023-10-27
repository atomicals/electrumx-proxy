import express from 'express';
import { ServerMessage, connectClient, connectedClient } from '../app';
import { UrnResponseFactory } from '../helpers/urn-response-factory';
import { decodeURN } from '../helpers/decode-urn';
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

router.get<{}, ObjectServeResponse>('/validate/:urn*', async (req, res) => {
  let params: any = req.params;
  let urn = params.urn;
  if (params['0']) {
    urn += params['0'];
  }
  const urnInfo = decodeURN(urn);
  res.status(200).json({ success: true, urnInfo } as any);
});

router.get<{}, ObjectServeResponse>('/:urn*', async (req, res) => {
  handleUrnRequest(req, res);
});

router.get<{}, ObjectServeResponse>('/', async (req, res) => {
  res.status(200).json(ServerMessage);
});

export default router;
