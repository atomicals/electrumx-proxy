
import { ElectrumApiInterface } from 'utils/builder/services/electrum-api.interface';
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
