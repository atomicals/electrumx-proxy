/* eslint-disable @typescript-eslint/no-unused-vars */
import * as ElectrumClient from 'electrum-client';
import { URNType, decodeURN } from '../helpers/decode-urn';
import { buildAtomicalsFileMapFromRawTx } from './builder/atomical-format-helpers';
import * as mime from 'mime-types';

export function isAtomicalId(atomicalId) {
  if (!atomicalId || !atomicalId.length || atomicalId.indexOf('i') !== 64) {
    return false;
  }
  try {
    const splitParts = atomicalId.split('i');
    const txid = splitParts[0];
    const index = parseInt(splitParts[1], 10);
    return {
      txid,
      index,
      atomicalId,
    };
  } catch (err) {
  }
  return null;
}

export class UrnResponseFactory {
  constructor(private client: ElectrumClient) {
  }

  async handleRequest(req: any, res: any, randomId: any) {
    let params = req.params;
    let urn = params.urn;
    if (params['0']) {
      urn += params['0'];
    }
    let path = params['0'];
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
    const response = await this.client.general_getRequest('blockchain.atomicals.get_state', [atomicalId]);
    let sizeResponse = -1;
    try {
      const serialized = JSON.stringify(response);
      sizeResponse = serialized.length;
    } catch (err) {
      // Ignore because it could not be json
      sizeResponse = response.length;
    }
    res.status(200).json({ success: true, response } as any);
  }

  private async handlePermanentData(dataId: string, path: string, res) {
    const atomicalIdInfo: any = isAtomicalId(dataId);
    const response = await this.client.general_getRequest('blockchain.transaction.get', [atomicalIdInfo.txid]);
    const fileMap = buildAtomicalsFileMapFromRawTx(response, true);

    if (fileMap && fileMap['0'] && fileMap['0']['decoded']) {
      const decoded = fileMap['0']['decoded'];
      console.log('path', path);
      const trimmedPath: any = path ? path.substring(1) : '';
      if (decoded[trimmedPath]) {

        const type = mime.lookup(trimmedPath) 
        console.log('type', type)
        res.set('Content-Type', type);
        res.status(200).send(Buffer.from(decoded[trimmedPath], 'hex'));
      } else {
        res.status(200).json(decoded);
      }
    
    } else {
      throw new Error('Not found');
    }
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