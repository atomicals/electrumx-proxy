require('dotenv').config();
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './interfaces/MessageResponse';

const app = express();
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'Atomicals ElectrumX Proxy Online.',
  });
});

console.log('process.env.ELECTRUMX_PORT', process.env.ELECTRUMX_PORT)
console.log('process.env.ELECTRUMX_HOST', process.env.ELECTRUMX_HOST)

app.use('/', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
