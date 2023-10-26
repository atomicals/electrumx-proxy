/* eslint-disable import/first */
import { CommandInterface } from './commands/command.interface';
import { MintInteractiveRealmCommand } from './commands/mint-interactive-realm-command';
import { AtomicalsApiInterface, BaseRequestOptions } from './atomicals-api.interface';
import { ElectrumApiInterface } from './services/electrum-api.interface';
import { CommandResultInterface } from './commands/command-result.interface';
import { ElectrumApi } from './services/electrum-api';

export class Atomicals implements AtomicalsApiInterface {
  constructor(private config: any, private electrumApi: ElectrumApiInterface) {}

  async mintRealm(
    requestRealm: string,
    address: string,
    fundingWIFCallback: Promise<string>,
    options: BaseRequestOptions
  ): Promise<CommandResultInterface> {
    try {
      await this.electrumApi.open();
      const command: CommandInterface = new MintInteractiveRealmCommand(
        this.electrumApi,
        requestRealm,
        address,
        fundingWIFCallback,
        options
      );
      return await command.run();
    } catch (error: any) {
      return {
        success: false,
        message: error.toString(),
        error,
      };
    } finally {
      this.electrumApi.close();
    }
  }
}

export function instance(config: any, electrumUrl: string): AtomicalsApiInterface {
  return new Atomicals(config, ElectrumApi.createClient(electrumUrl));
}

try {
  // Running under node, we are in command line mode
  if (typeof window !== 'undefined') {
    // otherwise we are being used as a kind of library
    window['atomicals'] = {
      instance: instance,
    };
  }
} catch (ex) {
  // Window is not defined, must be running in windowless node env...
  console.log('atomicals window object not found. Skipping initialization on window object');
}
