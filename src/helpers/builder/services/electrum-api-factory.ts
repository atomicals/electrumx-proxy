import { ElectrumApi } from './electrum-api';
import { ElectrumApiInterface } from './electrum-api.interface';

export class ElectrumApiFactory {
  constructor(private url: string, private electrumApi?: ElectrumApiInterface) {}
  create() {
    if (this.electrumApi) {
      return this.electrumApi;
    }
    return ElectrumApi.createClient(this.url);
  }
}

export class ElectrumApiMockFactory {
  constructor(private api: ElectrumApiInterface | undefined) {}
  getMock() {
    if (process.env.REACT_APP_ELECTRUMX_API_MOCK === 'true') {
      return this.api;
    }
    return undefined;
  }
}
