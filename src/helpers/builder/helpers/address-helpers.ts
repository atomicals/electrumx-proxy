/* eslint-disable import/first */
import * as bs58check from 'bs58check';
import { sha256 } from 'js-sha256';
var Buffer = require('buffer/').Buffer; // note: the trailing slash is important!
window['Buffer'] = window['Buffer'] || Buffer;
window['bitcoin'] = window['bitcoin'] || {};
// eslint-disable-next-line import/first
//import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs';
import * as ecc from '@bitcoinerlab/secp256k1';
// eslint-disable-next-line import/first
window['bitcoin'].initEccLib(ecc);
var bitcoin = window['bitcoin'];
export function detectAddressTypeToScripthash(address: string): {
  output: string;
  scripthash: string;
  address: string;
} {
  // Detect legacy address
  try {
    bitcoin.address.fromBase58Check(address);
    const p2pkh = addressToP2PKH(address);
    const p2pkhBuf = Buffer.from(p2pkh, 'hex');
    return {
      output: p2pkh,
      scripthash: Buffer.from(sha256(p2pkhBuf), 'hex').reverse().toString('hex'),
      address,
    };
  } catch (err) {}

  // Detect segwit or taproot
  const detected = bitcoin.address.fromBech32(address);
  if (address.indexOf('bc1p') === 0) {
    const output = bitcoin.address.toOutputScript(address);
    return {
      output,
      scripthash: Buffer.from(sha256(output), 'hex').reverse().toString('hex'),
      address,
    };
  } else if (address.indexOf('bc1') === 0) {
    const output = bitcoin.address.toOutputScript(address);
    return {
      output,
      scripthash: Buffer.from(sha256(output), 'hex').reverse().toString('hex'),
      address,
    };
  } else {
    throw new Error('unrecognized address');
  }
}

export function detectScriptToAddressType(script: string): string {
  const address = bitcoin.address.fromOutputScript(Buffer.from(script, 'hex'));
  return address;
}

export function addressToScripthash(address: string): string {
  const p2pkh = addressToP2PKH(address);
  const p2pkhBuf = Buffer.from(p2pkh, 'hex');
  return Buffer.from(sha256(p2pkhBuf), 'hex').reverse().toString('hex');
}

export function addressToP2PKH(address: string): string {
  const addressDecoded = bs58check.decode(address);
  const addressDecodedSub = addressDecoded.toString().substr(2);
  const p2pkh = `76a914${addressDecodedSub}88ac`;
  return p2pkh;
}

export function addressToHash160(address: string): string {
  const addressDecoded = bs58check.decode(address);
  const addressDecodedSub = addressDecoded.toString().substr(2);
  return addressDecodedSub;
}
export function hash160BufToAddress(hash160: Buffer): string {
  const addressEncoded = bs58check.encode(hash160);
  return addressEncoded;
}
export function hash160HexToAddress(hash160: string): string {
  const addressEncoded = bs58check.encode(Buffer.from(hash160, 'hex'));
  return addressEncoded;
}
   