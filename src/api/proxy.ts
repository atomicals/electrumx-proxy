import express from 'express';
import { ServerMessage, connectClient, connectedClient } from '../app';
const router = express.Router();
type ProxyResponse = any;

router.get<{}, ProxyResponse>('/health', async (req, res) => {
  if (!connectedClient) {
    await connectClient();
  }
  try {
    await connectedClient.serverDonation_address();
    res.status(200).json({ success: true, health: true } as any);

  } catch (err: any) {
    console.log('health_error', req.ip, err);
    res.status(500).json({ success: false, health: false, message: err.message ? err.message : err.toString() } as any);
  }
});

/**
 * Handles the request via GET/POST to proxy a request
 * @param req Request object
 * @param res Response object
 * @returns 
 */
const handleProxyRequest = async (req, res) => {
  const method = req.params.method;
  const randomId = Math.floor(Math.random() * 100000000);
  console.log('request', req.ip, randomId, method, req.params, req.query);
  if (!connectedClient) {
    await connectClient();
  }
  let params: any;
  if (req.method === 'GET') {
    params = req.query.params || '[]';
    if (params) {
      // Params can be hex encoded
      if (/^[a-fA-F0-9]+$/.test(params)) {
        params = Buffer.from(params, 'hex').toString('utf8');
      }
      // If it wasnt hex encoded try to detect JSON string
      try {
        params = JSON.parse(params);
      } catch (err) {
        console.log('request_json_parse_error', req.ip, randomId, method, err);
        res.status(422).json({ success: false, message: 'invalid params decode' } as any);
        return;
      }
      if (!Array.isArray(params)) {
        console.log('request_json_array_error', req.ip, randomId, method);
        res.status(422).json({ success: false, message: 'invalid params not array' } as any);
        return;
      }

    }
  } else if (req.method === 'POST') {
    params = req.body.params;
    console.log('params', params);
  } else {
    throw new Error('unsupported HTTP method');
  }
  try {
    const response = await connectedClient.general_getRequest(method, params);
    let sizeResponse = -1;
    try {
      const serialized = JSON.stringify(response);
      sizeResponse = serialized.length;
    } catch (err) {
      // Ignore because it could not be json
      sizeResponse = response.length;
    }
    console.log('request_success', req.ip, randomId, 'length: ' + sizeResponse);
    if (req.query.unwrap) {
      res.status(200).json(response as any);
    } else {
      res.status(200).json({ success: true, response } as any);
    }
  } catch (err: any) {
    console.log('request_error', req.ip, randomId, method, err);
    let statusCode = 500;
    if (err.code === 800422) {
      statusCode = 422;
    }
    res.status(statusCode).json({ success: false, code: err.code ? err.code : undefined, message: err.message ? err.message : err.toString() } as any);
  }
};

router.get<{}, ProxyResponse>('/:method', async (req, res) => {
  handleProxyRequest(req, res);
});

router.post<{}, ProxyResponse>('/:method', async (req, res) => {
  handleProxyRequest(req, res);
});

router.get<{}, ProxyResponse>('/', async (req, res) => {
  res.status(200).json(ServerMessage);
});

export default router;
