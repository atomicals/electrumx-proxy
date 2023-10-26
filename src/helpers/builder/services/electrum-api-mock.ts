import { ElectrumApiInterface } from './electrum-api.interface';

export class ElectrumApiMock implements ElectrumApiInterface {
  private sendTransactionCallback: Function | undefined;
  private getUnspentAddressCallBack: Function | undefined;
  private getUnspentScripthashCallBack: Function | undefined;
  private getTxCallback: Function | undefined;
  private getStateCallback: Function | undefined;
  private getAtomicalsGetLocationCallback: Function | undefined;
  private getRealmInfoCallback: Function | undefined;
  private atomicalsByScripthashCallback: Function | undefined;

  async close() {}

  async open() {}

  isOpen() {
    return true;
  }

  async estimateFee(blocks: number) {
    return 'estimateFee';
  }

  async resetConnection() {
  }

  async atomicalsGetGlobal(hashes: number) {
    return null;
  }

  setSendTransaction(cb: Function) {
    return (this.sendTransactionCallback = cb);
  }

  async sendTransaction(rawtx: string): Promise<string> {
    if (!this.sendTransactionCallback) {
      throw 'sendTransactionCallback undefined';
    }
    return this.sendTransactionCallback(rawtx);
  }

  setGetUnspentAddress(cb: Function) {
    return (this.getUnspentAddressCallBack = cb);
  }

  async getUnspentAddress(address: string): Promise<any> {
    if (!this.getUnspentAddressCallBack) {
      throw 'getUnspentAddressCallBack undefined';
    }
    return this.getUnspentAddressCallBack(address);
  }

  setGetUnspentScripthash(cb: Function) {
    return (this.getUnspentScripthashCallBack = cb);
  }

  async getUnspentScripthash(scripthash: string): Promise<any> {
    if (!this.getUnspentScripthashCallBack) {
      throw 'getUnspentScripthashCallBack undefined';
    }
    return this.getUnspentScripthashCallBack(scripthash);
  }

  setGetTx(cb: Function) {
    return (this.getTxCallback = cb);
  }

  async getTx(txid: string, verbose = false): Promise<any> {
    if (!this.getTxCallback) {
      throw 'getTxCallback undefined';
    }
    return this.getTxCallback(txid);
  }

  async waitUntilUTXO(address: string, satoshis: number, intervalSeconds = 10): Promise<any> {
    return new Promise<any[]>((resolve, reject) => {
      let intervalId: any;
      const checkForUtxo = async () => {
        try {
          const response: any = await this.getUnspentAddress(address);
          const utxos = response.utxos;

          for (const utxo of utxos) {
            console.log('utxo', utxo);
            if (utxo.value >= satoshis) {
              return utxo;
            }
          }
        } catch (error) {
          reject(error);
          clearInterval(intervalId);
        }
      };
      intervalId = setInterval(checkForUtxo, intervalSeconds * 1000);
    });
  }
  public async serverVersion(): Promise<any> {
    return 'test mock';
  }
  public async broadcast(rawtx: string): Promise<any> {
    return 'send';
  }
  public async history(scripthash: string): Promise<any> {
    return 'history';
  }
  public async atomicalsGet(atomicalAliasOrId: string | number): Promise<any> {
    return 'atomicalsGet';
  }

  public async atomicalsGetLocation(atomicalAliasOrId: string | number): Promise<any> {
    if (this.getAtomicalsGetLocationCallback) {
      return this.getAtomicalsGetLocationCallback(atomicalAliasOrId);
    } else {
      throw new Error('not impl');
    }
  }

  setAtomicalsGetLocationCallback(cb: Function) {
    return (this.getAtomicalsGetLocationCallback = cb);
  }

  public async atomicalsGetState(
    atomicalAliasOrId: string | number,
    path: string,
    verbose?: any
  ): Promise<any> {
    if (this.getStateCallback) {
      return this.getStateCallback(atomicalAliasOrId, path, verbose);
    } else {
      throw new Error('not impl');
    }
  }

  setGetStateCallback(cb: Function) {
    return (this.getStateCallback = cb);
  }

  public async atomicalsGetStateHistory(atomicalAliasOrId: string | number): Promise<any> {
    return 'atomicalsGetStateHistory';
  }
  public async atomicalsGetEventHistory(atomicalAliasOrId: string | number): Promise<any> {
    return 'atomicalsGetEventHistory';
  }
  public async atomicalsGetTxHistory(atomicalAliasOrId: string | number): Promise<any> {
    return 'atomicalsGetTxHistory';
  }
  public async atomicalsList(limit: number, offset: number, asc: boolean): Promise<any> {
    return 'atomicalsList';
  }
  public async atomicalsByScripthash(scripthash: string, verbose = true): Promise<any> {
    if (this.atomicalsByScripthashCallback) {
      return this.atomicalsByScripthashCallback(scripthash, verbose);
    } else {
      throw new Error('Not implemented');
    }
  }

  setAtomicalsByScripthash(cb: Function) {
    return (this.atomicalsByScripthashCallback = cb);
  }

  public async atomicalsByAddress(address: string): Promise<any> {
    return 'atomicalsByAddress';
  }
  public async atomicalsAtLocation(location: string): Promise<any> {
    return 'atomicalsAtLocation';
  }
  public async atomicalsGetMintData(atomicalAliasOrId: string | number): Promise<any> {
    return 'atomicalsGetMintData';
  }
  public async atomicalsGetByRealm(realm: string): Promise<any> {
    return 'atomicalsGetByRealm';
  }

  setGetRealmInfoCallback(cb: Function) {
    return (this.getRealmInfoCallback = cb);
  }

  public async atomicalsGetRealmInfo(realmOrSubRealm: string, verbose?: boolean): Promise<any> {
    if (this.getRealmInfoCallback) {
      return this.getRealmInfoCallback(realmOrSubRealm, verbose);
    } else {
      throw new Error('not impl');
    }
  }
  public async atomicalsGetByTicker(ticker: string): Promise<any> {
    return 'atomicalsGetByTicker';
  }
  public async atomicalsGetByContainer(container: string): Promise<any> {
    return 'atomicalsGetByContainer';
  }

  public async atomicalsFindTickers(tickerPrefix: string | null, asc?: boolean): Promise<any> {
    return 'atomicalsFindTickers';
  }
  public async atomicalsFindContainers(
    containerPrefix: string | null,
    asc?: boolean
  ): Promise<any> {
    return 'atomicalsFindContainers';
  }
  public async atomicalsFindRealms(realmPrefix: string | null, asc?: boolean): Promise<any> {
    return 'atomicalsFindRealms';
  }
  public async atomicalsFindSubRealms(
    parentRealmId: string,
    subrealmPrefix: string | null,
    asc?: boolean
  ): Promise<any> {
    return 'atomicalsFindSubRealms';
  }
}
