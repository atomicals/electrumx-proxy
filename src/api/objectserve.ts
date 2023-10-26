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
  res.status(200).json({ success: true } as any);
}

router.get<{}, ObjectServeResponse>('/:urn', async (req, res) => {
  handleUrnRequest(req, res);
});

router.get<{}, ObjectServeResponse>('/', async (req, res) => {
  res.status(200).json(ServerMessage);
});

export default router;
