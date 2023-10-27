/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */
import { detectAddressTypeToScripthash } from "../helpers/address-helpers";
import { ElectrumApiInterface, IUnspentResponse, UTXO, hasAttachedAtomicals } from "./electrum-api.interface";

import axios from 'axios';

export class ElectrumApi implements ElectrumApiInterface {
    private isOpenFlag = false;

    private constructor(private baseUrl: string) {
        this.resetConnection();
    }

    public async resetConnection() {

    }

    static createClient(url: string) {
        return new ElectrumApi(url);
    }

    public async estimateFee(blocks = 1) {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.estimatefee', [blocks]).then(function (result: any) {
                resolve({
                    success: true,
                    result
                });
            }).catch((error) => {
                reject(error);
            })
        });
        return p;
    }

    public async open(): Promise<any> {
        const p = new Promise((resolve, reject) => {
            if (this.isOpenFlag) {
                resolve(true);
                return;
            }
            resolve(true);
        });
        return p;
    }

    public isOpen(): boolean {
        return this.isOpenFlag;
    }

    public async close(): Promise<any> {
        const p = new Promise((resolve, reject) => {
            resolve(true);
        });
        return p;
    }

    public async call(method, params) {
        const response = await axios.get(this.baseUrl + '/' + method + '?params=' + JSON.stringify(params));
        return response.data.response;
    }

    public async sendTransaction(signedRawtx: string): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.transaction.broadcast', [signedRawtx]).then(function (result: any) {
                console.log('result', result);
                resolve(result);
            }).catch((error) => {
                console.log('error', error);
                reject(error);
            })
        });
        return p;
    }

    public async getTx(txid: string, verbose = false): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.transaction.get', [txid, verbose ? 1 : 0]).then(function (result: any) {
                resolve({
                    success: true,
                    tx: result
                });
            }).catch((error) => {
                reject(error);
            })
        });
        return p;
    }

    public async getUnspentAddress(address: string): Promise<IUnspentResponse | any> {
        const { scripthash } = detectAddressTypeToScripthash(address)
        return this.getUnspentScripthash(scripthash)
    }

    public async getUnspentScripthash(scripthash: string): Promise<IUnspentResponse | any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.scripthash.listunspent', [scripthash]).then(function (result: any) {
                const data = {
                    unconfirmed: 0,
                    confirmed: 0,
                    //balance: 0,
                    utxos: [] as UTXO[]
                };

                for (const utxo of result) {
                    if (!utxo.height || utxo.height <= 0) {
                        data.unconfirmed += utxo.value;
                    } else {
                        data.confirmed += utxo.value;
                    }
                    //data.balance += utxo.value;
                    data.utxos.push({
                        txid: utxo.tx_hash,
                        txId: utxo.tx_hash,
                        // height: utxo.height,
                        outputIndex: utxo.tx_pos,
                        index: utxo.tx_pos,
                        vout: utxo.tx_pos,
                        value: utxo.value,
                        //atomicals: utxo.atomicals,
                        //script: addressToP2PKH(address)
                    })
                }
                resolve(data);
            }).catch((error) => {
                reject(error);
            })

        });
        return p;
    }

    async waitUntilUTXO(address: string, satoshis: number, intervalSeconds = 10, exactSatoshiAmount = false): Promise<any> {
        return new Promise<any[]>((resolve, reject) => {
            let intervalId: any;
            const checkForUtxo = async () => {
                console.log('...');
                try {
                    const response: any = await this.getUnspentAddress(address);
                    const utxos = response.utxos;
                    for (const utxo of utxos) {
                        // Do not use utxos that have attached atomicals
                        if (hasAttachedAtomicals(utxo)) {
                            continue;
                        }
                        // If the exact amount was requested, then only return if the exact amount is found
                        if (exactSatoshiAmount) {
                            if (utxo.value === satoshis) {
                                clearInterval(intervalId);
                                resolve(utxo);
                                return;
                            }
                        } else {
                            if (utxo.value >= satoshis) {
                                clearInterval(intervalId);
                                resolve(utxo);
                                return;
                            }
                        }
                    }
                } catch (error) {
                    console.log('error', error);
                    reject(error);
                    clearInterval(intervalId);
                }
            };
            intervalId = setInterval(checkForUtxo, intervalSeconds * 1000);
        });
    }

    public async serverVersion(): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('server.version', []).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        });
        return p;
    }

    public async broadcast(rawtx: string): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.transaction.broadcast', [rawtx]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                reject(error);
            })
        });
        return p;
    }

    public async dump(): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.dump', []).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsGetGlobal(hashes: number): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.get_global', [hashes]).then(function (result: any) {
                console.log('response', result)
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsGet(atomicalAliasOrId: string | number): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.get', [atomicalAliasOrId]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsGetFtInfo(atomicalAliasOrId: string | number): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.get_ft_info', [atomicalAliasOrId]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsGetLocation(atomicalAliasOrId: string | number): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.get_location', [atomicalAliasOrId]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsGetStateHistory(atomicalAliasOrId: string | number): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.get_state_history', [atomicalAliasOrId]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }
    public async atomicalsGetState(atomicalAliasOrId: string | number, path: string, verbose?: boolean): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.get_state_by_path', [atomicalAliasOrId, path, verbose ? 1 : 0]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsGetEventHistory(atomicalAliasOrId: string | number): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.get_events', [atomicalAliasOrId]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsGetTxHistory(atomicalAliasOrId: string | number): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.get_tx_history', [atomicalAliasOrId]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async history(scripthash: string): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.scripthash.get_history', [scripthash]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsList(limit: number, offset: number, asc = false): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.list', [limit, offset, asc ? 1 : 0]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsByScripthash(scripthash: string, verbose = true): Promise<any> {
        const p = new Promise((resolve, reject) => {
            const params: any[] = [scripthash];
            if (verbose) {
                params.push(true)
            }
            this.call('blockchain.atomicals.listscripthash', params).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsByAddress(address: string): Promise<any> {
        const { scripthash } = detectAddressTypeToScripthash(address);
        return this.atomicalsByScripthash(scripthash)
    }

    public async atomicalsAtLocation(location: string): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.at_location', [location]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async txs(txs: string[], verbose: boolean): Promise<any> {
        let p;
        if (true) {
            p = []
            for (const tx of txs) {
                p.push(new Promise((resolve, reject) => {
                    this.call('blockchain.transaction.get', [tx, verbose ? 1 : 0]).then(function (result: any) {
                        resolve(result);
                    }).catch((error) => {
                        console.log('error ', error)
                        reject(error);
                    })
                }))
            }
            return Promise.all(p);
        }
    }

    public async atomicalsGetRealmInfo(realmOrSubRealm: string, verbose?: boolean): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.get_realm_info', [realmOrSubRealm, verbose ? 1 : 0]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsGetByRealm(realm: string): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.get_by_realm', [realm]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsGetByTicker(ticker: string): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.get_by_ticker', [ticker]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsGetByContainer(container: string): Promise<any> {
        const p = new Promise((resolve, reject) => {
            this.call('blockchain.atomicals.get_by_container', [container]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsFindTickers(prefix: string | null, asc?: boolean): Promise<any> {
        const p = new Promise((resolve, reject) => {
            const args: any = []
            args.push(prefix ? prefix : null)
            if (!asc) {
                args.push(1)
            } else {
                args.push(0)
            }
            this.call('blockchain.atomicals.find_tickers', args).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsFindContainers(prefix: string | null, asc?: boolean): Promise<any> {
        const p = new Promise((resolve, reject) => {
            const args: any = []
            args.push(prefix ? prefix : null)
            if (!asc) {
                args.push(1)
            } else {
                args.push(0)
            }
            this.call('blockchain.atomicals.find_containers', args).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsFindRealms(prefix: string | null, asc?: boolean): Promise<any> {
        const p = new Promise((resolve, reject) => {
            const args: any = []
            args.push(prefix ? prefix : null)
            if (!asc) {
                args.push(1)
            } else {
                args.push(0)
            }
            this.call('blockchain.atomicals.find_realms', args).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }

    public async atomicalsFindSubRealms(parentRealmId: string, prefix: string | null, asc?: boolean): Promise<any> {
        const p = new Promise((resolve, reject) => {
            const args: any = []
            args.push(prefix ? prefix : null)
            if (!asc) {
                args.push(1)
            } else {
                args.push(0)
            }
            this.call('blockchain.atomicals.find_subrealms', [parentRealmId, args]).then(function (result: any) {
                resolve(result);
            }).catch((error) => {
                console.log('error ', error)
                reject(error);
            })
        });
        return p;
    }
}
