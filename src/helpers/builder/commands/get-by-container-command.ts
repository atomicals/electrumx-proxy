
import { ElectrumApiInterface } from '../../builder/services/electrum-api.interface';
import { decorateAtomical } from '../atomical-format-helpers';
import { AtomicalsGetFetchType, CommandInterface } from './command.interface';
import { GetCommand } from './get-command';

export class GetByContainerCommand implements CommandInterface {
  constructor(
    private electrumApi: ElectrumApiInterface,
    private container: string,
    private fetchType: AtomicalsGetFetchType = AtomicalsGetFetchType.GET,
    private path?: string,
    private verbose?: boolean
  ) { }

  async run(): Promise<any> {
    const trimmedContainer = this.container.startsWith('#')
      ? this.container.substring(1)
      : this.container;
    const responseResult = await this.electrumApi.atomicalsGetByContainer(trimmedContainer);
    if (!responseResult.result || !responseResult.result.atomical_id) {
      return {
        success: false,
        data: responseResult.result,
      };
    }
    // https://ob.atomicals.xyz/urn/atom:btc:dat:0d4d83cfb24b6d740031fb937daed09dc77fa4d0a1e46e3b0aa57c992f4863dei0
    const getDefaultCommand = new GetCommand(
      this.electrumApi,
      responseResult.result.atomical_id,
      this.fetchType,
      this.path,
      this.verbose
    );
    const getDefaultCommandResponse = await getDefaultCommand.run();
    const updatedRes = Object.assign({}, getDefaultCommandResponse.data, {
      result: decorateAtomical(getDefaultCommandResponse.data.result),
    });
    return {
      success: true,
      data: updatedRes,
    };
  }
}
