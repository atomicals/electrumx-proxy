
import { AtomicalsGetFetchType, CommandInterface } from './command.interface';
import {
  AtomicalIdentifierType,
  AtomicalResolvedIdentifierReturn,
  decorateAtomical,
  getAtomicalIdentifierType,
} from '../atomical-format-helpers';
import { GetByRealmCommand } from './get-by-realm-command';
import { GetByContainerCommand } from './get-by-container-command';
import { GetByTickerCommand } from './get-by-ticker-command';
import { GetCommand } from './get-command';
import { ElectrumApiInterface } from 'utils/builder/services/electrum-api.interface';

export class ResolveCommand implements CommandInterface {
  constructor(
    private electrumApi: ElectrumApiInterface,
    private atomicalAliasOrId: any,
    private fetchType: AtomicalsGetFetchType = AtomicalsGetFetchType.GET,
    private path?: string,
    private verbose?: boolean
  ) { }

  async run(): Promise<any> {
    const atomicalType: AtomicalResolvedIdentifierReturn = getAtomicalIdentifierType(
      this.atomicalAliasOrId
    );
    let foundAtomicalResponse;
    let cmd;
    if (
      atomicalType.type === AtomicalIdentifierType.ATOMICAL_ID ||
      atomicalType.type === AtomicalIdentifierType.ATOMICAL_NUMBER
    ) {
      cmd = new GetCommand(
        this.electrumApi,
        atomicalType.providedIdentifier || '',
        this.fetchType,
        this.path,
        this.verbose
      );
    } else if (atomicalType.type === AtomicalIdentifierType.REALM_NAME) {
      cmd = new GetByRealmCommand(
        this.electrumApi,
        atomicalType.realmName || '',
        this.fetchType,
        this.path,
        this.verbose
      );
    } else if (atomicalType.type === AtomicalIdentifierType.CONTAINER_NAME) {
      cmd = new GetByContainerCommand(
        this.electrumApi,
        atomicalType.containerName || '',
        this.fetchType,
        this.path,
        this.verbose
      );
    } else if (atomicalType.type === AtomicalIdentifierType.TICKER_NAME) {
      cmd = new GetByTickerCommand(
        this.electrumApi,
        atomicalType.tickerName || '',
        this.fetchType,
        this.path,
        this.verbose
      );
    }
    const cmdResponse = await cmd.run();
    if (!cmdResponse || !cmdResponse.success) {
      return cmdResponse;
    }
    foundAtomicalResponse = cmdResponse.data;
    const updatedRes = Object.assign({}, foundAtomicalResponse, {
      result: decorateAtomical(foundAtomicalResponse.result),
    });
    return {
      success: true,
      data: updatedRes,
    };
  }
}
