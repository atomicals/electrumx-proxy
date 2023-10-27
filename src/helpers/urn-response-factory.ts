/* eslint-disable @typescript-eslint/no-unused-vars */
import * as ElectrumClient from 'electrum-client';
import { decodeURN } from '../helpers/decode-urn';

export class UrnResponseFactory {
  constructor(private client: ElectrumClient) {
  }

  async handleRequest(req: any, res: any, randomId: any) {
    let params = req.params;
    let urn = params.urn;
    let path = params.path;
    const urnInfo = decodeURN(urn);
    try {

      /*
        const response = await this.client.general_getRequest('blockchain.atomicals.get_state', params);
        let sizeResponse = -1;
        try {
          const serialized = JSON.stringify(response);
          sizeResponse = serialized.length
        } catch (err) {
          // Ignore because it could not be json
          sizeResponse = response.length;
        }*/
      console.log('request_success', req.ip, randomId);
      res.status(200).json({ success: true, urnInfo, path } as any);

    } catch (err: any) {
      console.log('request_error', req.ip, randomId, 'urn-response', err);
      let statusCode = 500;
      if (err.code === 800422) {
        statusCode = 422;
      }
      res.status(statusCode).json({ success: false, code: err.code ? err.code : undefined, message: err.message ? err.message : err.toString() } as any);
      return;
    }

  }

  private async handleAtomicalData(atomicalId: string, path: string, res) {

    return null;
  }

  private async handlePermanentData(dataId: string, path: string, res) {

    return null;
  }

  private async handleContainerData(containerName: string, path: string, res) {

    return null;
  }

  private async handleRealmData(realmData: string, path: string, res) {

    return null;
  }

  private async handleArcData(realmData: string, path: string, res) {

    return null;
  }
}