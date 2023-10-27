/* eslint-disable import/first */
var Buffer = require('buffer/').Buffer; // note: the trailing slash is important!
window['Buffer'] = window['Buffer'] || Buffer;
window['bitcoin'] = window['bitcoin'] || {};
// eslint-disable-next-line import/first
//import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs';
import * as ecc from '@bitcoinerlab/secp256k1';
// eslint-disable-next-line import/first
window['bitcoin'].initEccLib(ecc);
import { AtomicalsGetFetchType, CommandInterface } from './command.interface';
import { GetByRealmCommand } from './get-by-realm-command';
import { isValidBitworkMinimum } from '../atomical-format-helpers';
import { AtomicalOperationBuilder } from '../atomical-operation-builder';
import { BaseRequestOptions, checkBaseRequestOptions } from '../atomicals-api.interface';
import { ElectrumApiInterface } from '../services/electrum-api.interface';

export class MintInteractiveRealmCommand implements CommandInterface {
  constructor(
    private electrumApi: ElectrumApiInterface,
    private requestRealm: string,
    private address: string,
    private fundingWIFCallback: any,
    private options: BaseRequestOptions,
    private onlyGetOperationBuilder = false
  ) {
    this.options = checkBaseRequestOptions(this.options);
    this.requestRealm = this.requestRealm.startsWith('+')
      ? this.requestRealm.substring(1)
      : this.requestRealm;
    isValidBitworkMinimum(this.options.bitworkc);
  }
  async run(): Promise<any> {
    // Check if the request already exists
    const getExistingNameCommand = new GetByRealmCommand(
      this.electrumApi,
      this.requestRealm,
      AtomicalsGetFetchType.GET,
      undefined
    );
    try {
      const getExistingNameResult = await getExistingNameCommand.run();
      if (getExistingNameResult.success && getExistingNameResult.data) {
        if (
          (getExistingNameResult.data.result && getExistingNameResult.data.result.atomical_id) ||
          getExistingNameResult.data.candidates.length
        ) {
          throw new Error('Already exists with that name. Try a different name.');
        }
      }
    } catch (err: any) {
      if (err.code !== 1) {
        throw err; // Code 1 means call correctly returned that it was not found
      }
    }

    const atomicalBuilder = new AtomicalOperationBuilder(
      {
        electrumApi: this.electrumApi,
        satsbyte: this.options.satsbyte,
        address: this.address,
        disableMiningChalk: this.options.disableMiningChalk,
        opType: 'nft',
        nftOptions: {
          satsoutput: this.options.satsoutput as any,
        },
        meta: this.options.meta,
        ctx: this.options.ctx,
        init: this.options.init,
        sleepEvery: this.options.sleepEvery,
        callbackProgress: this.options.callbackProgress
      },
      this.fundingWIFCallback
    );
    // Set to request a container
    atomicalBuilder.setRequestRealm(this.requestRealm);
    // Attach a container request
    if (this.options.container) atomicalBuilder.setContainerMembership(this.options.container);
    // Attach any requested bitwork
    if (this.options.bitworkc) {
      atomicalBuilder.setBitworkCommit(this.options.bitworkc);
    }
    if (this.options.bitworkr) {
      atomicalBuilder.setBitworkReveal(this.options.bitworkr);
    }

    if (this.options.parent) {
      atomicalBuilder.setInputParent(
        await AtomicalOperationBuilder.resolveInputParent(
          this.electrumApi,
          this.options.parent,
          this.options.parentOwner as any
        )
      );
    }

    // The receiver output
    atomicalBuilder.addOutput({
      address: this.address,
      value: (this.options.satsoutput as any) || 1000,
    });

    if (this.onlyGetOperationBuilder) {
      return atomicalBuilder;
    }

    const result = await atomicalBuilder.start();
    return {
      success: true,
      data: result,
    };
  }
}
