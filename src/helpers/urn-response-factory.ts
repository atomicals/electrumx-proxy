/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as ElectrumClient from 'electrum-client';
import { URNType, decodeURN } from '../helpers/decode-urn';
import { buildAtomicalsFileMapFromRawTx } from './builder/atomical-format-helpers';
import * as mime from 'mime-types';

function isImageFile(imagefile) {
  if (!imagefile) {
    return false;
  }
  const splitname = imagefile.split('.');
  if (splitname.length !== 2) {
    return false;
  }
  const extName = splitname[1];
  return extName === 'jpg' || extName === 'gif' || extName === 'jpeg' || extName === 'png' || extName === 'svg' || extName === 'webp';
}

export function getFirstImagePath(state): any {
  for (const prop in state) {
    if (!state.hasOwnProperty(prop)) {
      continue;
    }
    if (isImageFile(prop)) {
      return prop;
    }
  }
  return null;
}

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
    let firstimage = false;
    if (!path && (req.query.firstimage || req.query.firstimage === '')) {
      firstimage = true;
    }
    console.log('firstimage', firstimage)
    try {
      const urnInfo = decodeURN(urn);
      let atomicalId: string | null = null;
      switch (urnInfo.urnType) {
        case URNType.DAT:
          this.handlePermanentData(urnInfo.identifier, path, res, firstimage);
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
      await this.handleAtomicalData(atomicalId as any, urnInfo.pathType as any, path, res, firstimage);
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

  private async handleAtomicalData(atomicalId: string, pathType: string | any, path: string, res, firstimage?: boolean) {
    const response = await this.client.general_getRequest('blockchain.atomicals.get_state', [atomicalId]);
    let sizeResponse = -1;
    try {
      let trimmedPath: any;
      if (path) {
        trimmedPath = path ? path.substring(1) : '';
      } else if (firstimage) {
        trimmedPath = getFirstImagePath(response.result.state.latest)
      }

      if (!trimmedPath || trimmedPath.trim() === "") {
        res.status(200).json(response.result.state.latest);
        return;
      }
      if (response.result && response.result.state.latest[trimmedPath]) {
        const fieldData = response.result.state.latest[trimmedPath];
        if (Buffer.isBuffer(fieldData)) {
          const type = mime.lookup(trimmedPath)
          res.set('Content-Type', type);
          res.status(200).send(Buffer.from(response.result.state.latest[trimmedPath], 'hex'));
          return;
        } else {
          if (fieldData['$b']) {
            if (fieldData['$ct']) {
              res.set('Content-Type', fieldData['$ct']);
            } else {
              const type = mime.lookup(trimmedPath)
              res.set('Content-Type', type);
            }
            if (fieldData['$b']['$d']) {
              res.status(200).send(Buffer.from(fieldData['$b']['$d'], 'hex'));
              return
            } else {
              res.status(200).send(Buffer.from(fieldData['$b'], 'hex'));
              return
            }
          }
          return;
        }
      } else {
        res.status(404).json({
          success: false,
          message: 'not found path'
        });
      }
    } catch (err) {
      // Ignore because it could not be json
      sizeResponse = response.length;
    }
    res.status(200).json(response.result.state.latest);
  }

  private async handlePermanentData(dataId: string, path: string, res, firstimage?: boolean) {
    const atomicalIdInfo: any = isAtomicalId(dataId);
    const response = await this.client.general_getRequest('blockchain.transaction.get', [atomicalIdInfo.txid]);
    const fileMap = buildAtomicalsFileMapFromRawTx(response, true);
    if (fileMap && fileMap['0'] && fileMap['0']['decoded']) {
      const decoded = fileMap['0']['decoded'];
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
    const response = await this.client.general_getRequest('blockchain.transaction.get_by_container', [containerName]);
    return response.result.atomical_id
  }

  private async resolveRealm(realm: string) {
    const response = await this.client.general_getRequest('blockchain.transaction.get_by_realm', [realm]);
    return response.result.atomical_id
  }

  private async resolveARC(ticker: string) {
    const response = await this.client.general_getRequest('blockchain.transaction.get_by_ticker', [ticker]);
    return response.result.atomical_id
  }
}