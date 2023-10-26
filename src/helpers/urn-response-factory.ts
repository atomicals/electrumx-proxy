import * as ElectrumClient from 'electrum-client';
import { decodeURN } from '../helpers/decode-urn';

export class UrnResponseFactory {
  constructor(private client: ElectrumClient) {

  }
  handleRequest(req: any, res: any) {
    let params = req.params;
    let urn = params.urn;
    const urnInfo = decodeURN(urn);

    res.status(200).json({ success: true, urn, urnInfo} as any);
  }
}