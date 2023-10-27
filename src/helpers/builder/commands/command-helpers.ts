/* eslint-disable import/first */
import * as ecc from '@bitcoinerlab/secp256k1';
var Buffer = require('buffer/').Buffer; // note: the trailing slash is important!
import { ECPairFactory, ECPairAPI, TinySecp256k1Interface } from 'ecpair';
const bitcoin = require('bitcoinjs-lib');
import * as cbor from 'borc';
var networks = bitcoin['networks'];
var script = bitcoin['script'];
var payments = bitcoin['payments'];

import { ResolveCommand } from './resolve-command';
import {
  ATOMICALS_PROTOCOL_ENVELOPE_ID,
  IsAtomicalOwnedByWalletRecord,
  decorateAtomical,
} from '../atomical-format-helpers';
import { ElectrumApiInterface } from '../../builder/services/electrum-api.interface';
import { IInputUtxoPartial } from '../atomical-operation-builder';
import { AtomicalsGetFetchType } from './command.interface';

export interface KeyPairInfo {
  address: string;
  output: string;
  childNodeXOnlyPubkey: any;
  tweakedChildNode: any;
  childNode: any;
}

export function chunkBuffer(buffer: any, chunkSize: number) {
  const result: any = [];
  const len = buffer.byteLength;
  let i = 0;
  while (i < len) {
    result.push(buffer.slice(i, (i += chunkSize)));
  }
  return result;
}

export class AtomicalsPayload {
  private cborEncoded;
  constructor(private originalData: any) {
    if (!originalData) {
      this.originalData = {};
      return;
    }

    function deepEqual(x, y) {
      const ok = Object.keys,
        tx = typeof x,
        ty = typeof y;
      return x && y && tx === 'object' && tx === ty
        ? ok(x).length === ok(y).length && ok(x).every(key => deepEqual(x[key], y[key]))
        : x === y;
    }

    function isAllowedtype(tc: any, allowBuffer = true): boolean {
      if (
        tc === 'object' ||
        tc === 'Number' ||
        tc === 'number' ||
        tc === 'null' ||
        tc === 'string' ||
        tc == 'boolean'
      ) {
        return true;
      }
      if (allowBuffer && tc === 'buffer') {
        return true;
      }
      return false;
    }

    function validateWhitelistedDatatypes(x, allowBuffer = true) {
      const ok = Object.keys;
      const tx = typeof x;
      const isAllowed = isAllowedtype(tx, allowBuffer);
      if (!isAllowed) {
        return false;
      }
      if (tx === 'object') {
        return ok(x).every(key => validateWhitelistedDatatypes(x[key], allowBuffer));
      }
      return true;
    }

    if (!validateWhitelistedDatatypes(originalData)) {
      throw new Error(
        'Invalid payload contains disallowed data types. Use only number, string, null, or buffer'
      );
    }

    // Also make sure that if either args, ctx, init, or meta are provided, then we never allow buffer.
    if (originalData['args']) {
      if (!validateWhitelistedDatatypes(originalData['args'], false)) {
        throw 'args field invalid due to presence of buffer type';
      }
    }
    if (originalData['ctx']) {
      if (!validateWhitelistedDatatypes(originalData['ctx'], false)) {
        throw 'ctx field invalid due to presence of buffer type';
      }
    }
    if (originalData['meta']) {
      if (!validateWhitelistedDatatypes(originalData['meta'], false)) {
        throw 'meta field invalid due to presence of buffer type';
      }
    }

    const payload = {
      ...originalData,
    };
    const cborEncoded = cbor.encode(payload);
    // Decode to do sanity check
    const cborDecoded = cbor.decode(cborEncoded);
    if (!deepEqual(cborDecoded, payload)) {
      throw new Error('CBOR Decode error objects are not the same. Developer error');
    }
    if (!deepEqual(originalData, payload)) {
      throw new Error('CBOR Payload Decode error objects are not the same. Developer error');
    }
    this.cborEncoded = cborEncoded;
  }
  get(): any {
    return this.originalData;
  }
  cbor(): any {
    return this.cborEncoded;
  }
}

function basename(path) {
  return path.split('/').reverse()[0];
}

export const prepareCommitRevealConfig = (
  opType: 'nft' | 'ft' | 'dft' | 'dmt' | 'sl' | 'x' | 'y' | 'mod' | 'evt' | 'dat',
  keypair: KeyPairInfo,
  atomicalsPayload: AtomicalsPayload,
  log = true
) => {
  const revealScript = appendMintUpdateRevealScript(opType, keypair, atomicalsPayload, log);
  const hashscript = script.fromASM(revealScript);
  const scriptTree = {
    output: hashscript,
  };
  const hash_lock_script = hashscript;
  const hashLockRedeem = {
    output: hash_lock_script,
    redeemVersion: 192,
  };
  const scriptP2TR = payments.p2tr({
    internalPubkey: keypair.childNodeXOnlyPubkey,
    scriptTree,
    network: networks.bitcoin,
  });

  const hashLockP2TR = payments.p2tr({
    internalPubkey: keypair.childNodeXOnlyPubkey,
    scriptTree,
    redeem: hashLockRedeem,
    network: networks.bitcoin,
  });
  return {
    scriptP2TR,
    hashLockP2TR,
    hashscript,
  };
};

export const appendMintUpdateRevealScript = (
  opType: 'nft' | 'ft' | 'dft' | 'dmt' | 'sl' | 'x' | 'y' | 'mod' | 'evt' | 'dat',
  keypair: KeyPairInfo,
  payload: AtomicalsPayload,
  log: boolean = true
) => {
  let ops = `${keypair.childNodeXOnlyPubkey.toString('hex')} OP_CHECKSIG OP_0 OP_IF `;
  ops += `${Buffer.from(ATOMICALS_PROTOCOL_ENVELOPE_ID, 'utf8').toString('hex')}`;
  ops += ` ${Buffer.from(opType, 'utf8').toString('hex')}`;
  const chunks = chunkBuffer(payload.cbor(), 520);
  for (let chunk of chunks) {
    ops += ` ${chunk.toString('hex')}`;
  }
  ops += ` OP_ENDIF`;
  return ops;
};

export const prepareFilesDataAsObject = async (fields: string[]) => {
  let fieldDataObject = {};
  for (const entry of fields) {
    if (entry.indexOf('=') !== -1) {
      const fieldName = entry.substring(0, entry.indexOf('='));
      const fieldValue = entry.substring(entry.indexOf('=') + 1);
      try {
        const parsedJson = JSON.parse(fieldValue);
        fieldDataObject[fieldName] = parsedJson;
      } catch (err) {
        if (typeof fieldValue === 'string') {
          try {
            const num = Number(fieldValue);
            if (!isNaN(num)) {
              fieldDataObject[fieldName] = Number(fieldValue);
            } else {
              fieldDataObject[fieldName] = fieldValue;
            }
          } catch (ex) {
            fieldDataObject[fieldName] = fieldValue;
          }
        }
      }
    } else {
      throw new Error('Invalid field(s) specifications. Aborting...');
    }
  }
  return fieldDataObject;
};

export const getAndCheckAtomicalInfo = async (
  electrumApi: ElectrumApiInterface,
  atomicalAliasOrId: any,
  expectedOwnerAddress: string,
  expectedType = 'NFT',
  expectedSubType: any = null
): Promise<{ atomicalInfo: any; locationInfo: any; inputUtxoPartial: IInputUtxoPartial }> => {
  const getLocationCommand = new ResolveCommand(
    electrumApi,
    atomicalAliasOrId,
    AtomicalsGetFetchType.LOCATION
  );
  const getLocationResponse = await getLocationCommand.run();
  if (!getLocationResponse.success) {
    throw new Error(`Error: Unable to get location. ${getLocationResponse}`);
  }
  const atomicalInfo = getLocationResponse.data.result;
  if (expectedType && atomicalInfo.type !== expectedType) {
    console.log('atomicalInfo', atomicalInfo);
    throw new Error(
      `Atomical is not an type ${expectedType}. It is expected to be an ${expectedType} type. atomicalAliasOrId=${atomicalAliasOrId}`
    );
  }

  if (expectedSubType && atomicalInfo.subtype !== expectedSubType) {
    console.log('atomicalInfo', atomicalInfo);
    throw `Atomical is not subtype ${expectedSubType}. It is expected to be an ${expectedSubType} type. atomicalAliasOrId=${atomicalAliasOrId}`;
  }

  const atomicalDecorated = decorateAtomical(atomicalInfo);
  let locationInfo = atomicalDecorated.location_info;
  // Check to make sure that the location is controlled by the same address as supplied by the WIF
  if (!locationInfo || !locationInfo.length || locationInfo[0].address !== expectedOwnerAddress) {
    locationInfo = locationInfo[0];
    throw `Atomical is controlled by a different address (${locationInfo.address}) than the provided wallet (${expectedOwnerAddress})`;
  }
  locationInfo = locationInfo[0];
  const inputUtxoPartial: any = IsAtomicalOwnedByWalletRecord(
    expectedOwnerAddress,
    atomicalDecorated
  );
  return {
    atomicalInfo,
    locationInfo,
    inputUtxoPartial,
  };
};
