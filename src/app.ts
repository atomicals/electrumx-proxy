require('dotenv').config();
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './interfaces/MessageResponse';
import pretty from 'express-prettify';

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

app.get<{}, MessageResponse>('/', (req, res) => {
  res.status(200).json(ServerMessage as any);
});

console.log('process.env.ELECTRUMX_PORT', process.env.ELECTRUMX_PORT)
console.log('process.env.ELECTRUMX_HOST', process.env.ELECTRUMX_HOST)

app.use('/', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
