require('dotenv').config();
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './interfaces/MessageResponse';
import pretty from 'express-prettify';
import slowDown  from 'express-slow-down';
import * as ElectrumClient from 'electrum-client';

const esPort = process.env.ELECTRUMX_PORT;
const esHost = process.env.ELECTRUMX_HOST;

export let connectedClient;
export let globalInterval;

/**
 * Connect the electrumX client and periodically test connection
 * Todo: There is a known bug where this keeps getting called
 * Todo: Fix to ensure there can only be one connection
 * 
 */
export const connectClient = async () => {
  try {
    let defaultClient = new ElectrumClient.default(esPort, esHost, 'tcp');

    defaultClient.onClose = () => {
      console.log(`Presisted Connection to ElectrumX(${esHost}:${esPort}) Server Closed.`);
      connectedClient = null;
      clearInterval(globalInterval);
    };
    await defaultClient.connect().then(() => {
      console.log(`Connected: ${esHost}:${esPort}`);
    });

    await defaultClient.server_version('Atomicals ElectrumX proxy v0.1', '1.4');
    connectedClient = defaultClient;
    // Prepare the keep Alive loop sends ping every 30 seconds
    globalInterval = setInterval(async () => {
      console.log(`Sending keep-alive to ElectrumX(${esHost}:${esPort})...`);
      await defaultClient.serverDonation_address();
    }, 30 * 1000);

  } catch (error) {
    console.log('connectClient:exception', error);
    connectedClient = null;
  }
};

export const ServerMessage = { 
  success: true, 
  info: {
    note: 'Atomicals ElectrumX Digital Object Proxy Online',
    usageInfo: {
      note: 'The service offers both POST and GET requests for proxying requests to ElectrumX. To handle larger broadcast transaction payloads use the POST method instead of GET.',
      POST: 'POST /proxy/:method with string encoded array in the field "params" in the request body. ',
      GET: 'GET /proxy/:method?params=["value1"] with string encoded array in the query argument "params" in the URL.',
    },
    healthCheck: 'GET /proxy/health',
    github: 'https://github.com/atomicals/electrumx-proxy',
    license: 'MIT',
  },
};

const app = express();
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb', type: 'application/json' }));
app.use(pretty({ query: 'pretty' }));

if (process.env.TRUST_PROXY === 'true') {
  app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)
}

const speedLimiter = slowDown({
  windowMs: process.env.RATE_LIMIT_WINDOW_SECONDS ? parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 10) * 1000 : 15 * 60 * 1000, // 15 minutes
  delayAfter: process.env.RATE_LIMIT_DELAY_AFTER ? parseInt(process.env.RATE_LIMIT_DELAY_AFTER, 10) : 100,  // allow 100 requests per 15 minutes, then...
  delayMs: process.env.RATE_LIMIT_DELAY_MS ? parseInt(process.env.RATE_LIMIT_DELAY_MS, 10) : 500, // begin adding 500ms of delay per request above 100:
});

//  apply to all requests
app.use(speedLimiter);


console.log('process.env.ELECTRUMX_PORT', process.env.ELECTRUMX_PORT);
console.log('process.env.ELECTRUMX_HOST', process.env.ELECTRUMX_HOST);

app.use('/', api);

 
app.get<{}, MessageResponse>('/', (req, res) => {
  res.status(200).json(ServerMessage as any);
});
 

app.get<{}, MessageResponse>('/health', async (req, res) => {
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

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
