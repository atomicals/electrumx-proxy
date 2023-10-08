import express from 'express';
import * as ElectrumClient from 'electrum-client';
const router = express.Router();
const esPort = process.env.ELECTRUMX_PORT;
const esHost = process.env.ELECTRUMX_HOST;

let connectedClient;
let globalInterval;
const connectClient = async () => {
  try {
    let defaultClient = new ElectrumClient.default(esPort, esHost, 'tcp')

    defaultClient.onClose = () => {
      console.log(`Presisted Connection to ElectrumX(${esHost}:${esPort}) Server Closed.`)
      connectedClient = null
      clearInterval(globalInterval);
    }
    await defaultClient.connect().then(() => {
      console.log(`Connected: ${esHost}:${esPort}`);
    })

    await defaultClient.server_version(`Atomicals ElectrumX proxy v0.1`, "1.4");
    connectedClient = defaultClient;

    // Prepare the keep Alive loop sends ping every 30 seconds
    globalInterval = setInterval(async () => {
      console.log(`Sending keep-alive to ElectrumX(${esHost}:${esPort})...`);
      const res = await defaultClient.serverDonation_address();
    }, 30 * 1000)

  } catch (error) {
    console.log('connectClient:exception', error);
    connectedClient = null;
  }
};

type ProxyResponse = any;

router.get<{}, ProxyResponse>('/health', async (req, res) => {
  if (!connectedClient) {
    await connectClient();
  }
  try {
    await connectedClient.serverDonation_address();
    res.status(200).json({ success: true, health: true } as any);

  } catch (err: any) {
    console.log('health_error', req.ip, err)
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
  const method = req.params['method'];
  const randomId = Math.floor(Math.random() * 100000000)
  console.log('request', req.ip, randomId, method, req.params, req.query)

  if (!connectedClient) {
    await connectClient();
  }
  let params: any;
  if (req.method === 'GET') {
    params = req.query.params || '[]'
    if (params) {
      try {
        params = JSON.parse(params);
      } catch (err) {
        console.log('request_json_parse_error', req.ip, randomId, method, err)
        res.status(422).json({ success: false, message: "invalid params decode" } as any);
        return;
      }
      if (!Array.isArray(params)) {
        console.log('request_json_array_error', req.ip, randomId, method)
        res.status(422).json({ success: false, message: "invalid params not array" } as any);
        return;
      }
    }
  } else if (req.method === 'POST') {
    params = req.body.params;
    console.log('params', params)
  } else {
    throw new Error('unsupported HTTP method')
  }
  try {
    const response = await connectedClient.general_getRequest(method, params);
    let sizeResponse = -1;
    try {
      const serialized = JSON.stringify(response);
      sizeResponse = serialized.length
    } catch (err) {
      // Ignore because it could not be json
      sizeResponse = response.length;
    }
    console.log('request_success', req.ip, randomId, 'length: ' + sizeResponse)
    res.status(200).json({ success: true, response } as any);

  } catch (err: any) {
    console.log('request_error', req.ip, randomId, method, err)
    res.status(500).json({ success: false, code: err.code ? err.code : undefined, message: err.message ? err.message : err.toString() } as any);
  }
}

router.get<{}, ProxyResponse>('/:method', async (req, res) => {
  handleProxyRequest(req, res);
});

router.post<{}, ProxyResponse>('/:method', async (req, res) => {
  handleProxyRequest(req, res);
});

export default router;
