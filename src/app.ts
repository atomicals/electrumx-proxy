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

export const ServerMessage = { 
  success: true, 
  info: {
    note: "Atomicals ElectrumX Proxy Online",
    usageInfo: {
      note: "The service offers both POST and GET requests for proxying requests to ElectrumX. To handle larger broadcast transaction payloads use the POST method instead of GET.",
      POST: "POST /proxy/:method with string encoded array in the field \"params\" in the request body. ",
      GET: "GET /proxy/:method?params=[\"value1\"] with string encoded array in the query argument \"params\" in the URL.",
    },
    healthCheck: "GET /proxy/health",
    github: "https://github.com/atomicals/electrumx-proxy",
    license: "MIT"
  }
};

const app = express();
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json({limit: '1mb', type: 'application/json'}));
app.use(pretty({ query: 'pretty' }));

if (process.env.TRUST_PROXY === 'true') {
  app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)
}

const speedLimiter = slowDown({
  windowMs: process.env.RATE_LIMIT_WINDOW_SECONDS ? parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 10) * 1000 : 15 * 60 * 1000, // 15 minutes
  delayAfter: process.env.RATE_LIMIT_DELAY_AFTER ? parseInt(process.env.RATE_LIMIT_DELAY_AFTER, 10) : 100,  // allow 100 requests per 15 minutes, then...
  delayMs: process.env.RATE_LIMIT_DELAY_MS ? parseInt(process.env.RATE_LIMIT_DELAY_MS, 10) : 500, // begin adding 500ms of delay per request above 100:
});

//  apply to all requests
app.use(speedLimiter);

app.get<{}, MessageResponse>('/', (req, res) => {
  res.status(200).json(ServerMessage as any);
});

console.log('process.env.ELECTRUMX_PORT', process.env.ELECTRUMX_PORT)
console.log('process.env.ELECTRUMX_HOST', process.env.ELECTRUMX_HOST)

app.use('/', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
