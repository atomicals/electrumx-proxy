import { CommandResultInterface } from './commands/command-result.interface';

export interface IWalletRecord {
  address: string;
  WIF: string;
  childNode?: any;
}

export interface IValidatedWalletInfo {
  primary: IWalletRecord;
  funding: IWalletRecord;
  imported: {
    [alias: string]: IWalletRecord;
  };
}

export interface BaseRequestOptions {
  meta?: string[] | any;
  ctx?: string[] | any;
  init?: string[] | any;
  satsbyte?: number;
  satsoutput?: number;
  container?: string;
  bitworkc?: string;
  bitworkr?: string;
  parent?: string;
  parentOwner?: IWalletRecord;
  disableMiningChalk?: boolean;
  callbackProgress?: Function;
}
export const BASE_REQUEST_OPTS_DEFAULTS = {
  satsbyte: 10,
  satsoutput: 1000,
};

export interface BaseRequestOptions {
  meta?: string[] | any;
  ctx?: string[] | any;
  init?: string[] | any;
  satsbyte?: number;
  satsoutput?: number;
  container?: string;
  bitworkc?: string;
  bitworkr?: string;
  parent?: string;
  parentOwner?: IWalletRecord;
  disableMiningChalk?: boolean;
  sleepEvery?: number;
}

export const checkBaseRequestOptions = (options: any): BaseRequestOptions => {
  if (!options) {
    options = BASE_REQUEST_OPTS_DEFAULTS;
  } else if (!options.satsbyte) {
    options.satsbyte = 10;
  }
  if (!options.satsoutput) {
    options.satsoutput = 546;
  }
  if (typeof options.satsbyte !== 'number') {
    options.satsbyte = parseInt(options.satsbyte as any, 10);
  }
  if (typeof options.satsoutput !== 'number') {
    options.satsoutput = parseInt(options.satsoutput as any, 10);
  }
  return options;
};

export interface AtomicalsApiInterface {
  mintRealm(
    requestRealm: string,
    address: string,
    fundingWIFCallback: Promise<string>,
    options: BaseRequestOptions
  ): Promise<CommandResultInterface>;
}
