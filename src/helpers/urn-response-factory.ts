/* eslint-disable @typescript-eslint/no-unused-vars */
import * as ElectrumClient from 'electrum-client';
import { URNType, decodeURN } from '../helpers/decode-urn';

export class UrnResponseFactory {
  constructor(private client: ElectrumClient) {
  }

  async handleRequest(req: any, res: any, randomId: any) {
    let params = req.params;
    let urn = params.urn;
    if (params['0']) {
      urn +=  params['0'];
    }
    let path = params.path;
    const urnInfo = decodeURN(urn);
    try {
      let atomicalId: string | null = null;
      switch (urnInfo.urnType) {
        case URNType.DAT:
          this.handlePermanentData(urnInfo.identifier, path, res);
          return;
        case URNType.REALM:
          atomicalId = await this.resolveRealm(urnInfo.identifier);
          break;
        case URNType.ARC:
          atomicalId = await this.resolveARC(urnInfo.identifier);
          break;
        case URNType.CONTAINER:
          atomicalId = await this.resolveContainer(urnInfo.identifier);
          break;
        case URNType.ATOMICAL_ID:
          atomicalId = urnInfo.identifier;
          break;
        default:
          break;
      }
      this.handleAtomicalData(atomicalId as any, urnInfo.pathType as any, path, res);
      // res.status(200).json({ success: true, urnInfo, path } as any);
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

  private async handleAtomicalData(atomicalId: string, pathType: string | any, path: string, res) {

    return null;
  }

  private async handlePermanentData(dataId: string, path: string, res) {

    return null;
  }

  private async resolveContainer(containerName: string) {

    return null;
  }

  private async resolveRealm(realm: string) {

    return null;
  }

  private async resolveARC(ticker: string) {

    return null;
  }
}